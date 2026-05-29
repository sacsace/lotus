import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pushReservationToMvs } from "@/lib/mvs";
import { getTenantBySlug } from "@/lib/tenant";

type Ctx = { params: Promise<{ tenantSlug: string; id: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  const { tenantSlug, id } = await ctx.params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) {
    return NextResponse.json({ error: "알 수 없는 호텔입니다." }, { status: 404 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const reservation = await tx.reservation.findFirst({
      where: { id, tenantId: tenant.id },
      include: { roomType: true, payments: true },
    });
    if (!reservation) return { error: "not_found" as const };
    if (reservation.status === "confirmed") {
      return { already: true, publicCode: reservation.publicCode };
    }
    if (reservation.status === "cancelled") {
      return { error: "cancelled" as const };
    }

    const pay = reservation.payments[0];
    if (!pay) return { error: "no_payment" as const };

    await tx.payment.update({
      where: { id: pay.id },
      data: { status: "completed", externalId: `mock_${Date.now()}` },
    });
    const updated = await tx.reservation.update({
      where: { id },
      data: { status: "confirmed" },
      include: { roomType: true },
    });
    return { reservation: updated };
  });

  if ("error" in result && result.error === "not_found") {
    return NextResponse.json({ error: "예약 없음" }, { status: 404 });
  }
  if ("error" in result && result.error === "cancelled") {
    return NextResponse.json({ error: "취소된 예약" }, { status: 400 });
  }
  if ("error" in result && result.error === "no_payment") {
    return NextResponse.json({ error: "결제 레코드 없음" }, { status: 500 });
  }
  if ("already" in result && result.already) {
    return NextResponse.json({ ok: true, publicCode: result.publicCode, message: "이미 확정" });
  }

  const r = "reservation" in result ? result.reservation : null;
  if (!r) return NextResponse.json({ error: "알 수 없음" }, { status: 500 });

  const sync = await pushReservationToMvs({
    publicCode: r.publicCode,
    guestName: r.guestName,
    guestEmail: r.guestEmail,
    checkIn: r.checkIn.toISOString().slice(0, 10),
    checkOut: r.checkOut.toISOString().slice(0, 10),
    roomTypeCode: r.roomType.code,
    totalAmount: r.totalAmount,
    mvsEnabled: tenant.mvsEnabled,
    mvsCompanyId: tenant.mvsCompanyId,
  });

  if (sync.mvsBookingId) {
    await prisma.reservation.update({
      where: { id: r.id },
      data: { mvsBookingId: sync.mvsBookingId },
    });
  }

  return NextResponse.json({
    ok: true,
    publicCode: r.publicCode,
    mvs: sync,
  });
}
