import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantBySlug } from "@/lib/tenant";

type Ctx = { params: Promise<{ tenantSlug: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const { tenantSlug } = await ctx.params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) {
    return NextResponse.json({ error: "알 수 없는 호텔입니다." }, { status: 404 });
  }

  let body: { publicCode?: string; guestEmail?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON 필요" }, { status: 400 });
  }
  const code = body.publicCode?.trim().toUpperCase();
  const email = body.guestEmail?.trim().toLowerCase();
  if (!code || !email) {
    return NextResponse.json({ error: "예약번호와 이메일을 입력하세요." }, { status: 400 });
  }

  const r = await prisma.reservation.findFirst({
    where: { publicCode: code, guestEmail: email, tenantId: tenant.id },
    include: { roomType: true, payments: true },
  });
  if (!r) {
    return NextResponse.json({ error: "일치하는 예약이 없습니다." }, { status: 404 });
  }

  return NextResponse.json({
    reservation: {
      publicCode: r.publicCode,
      guestName: r.guestName,
      checkIn: r.checkIn.toISOString().slice(0, 10),
      checkOut: r.checkOut.toISOString().slice(0, 10),
      guests: r.guests,
      status: r.status,
      totalAmount: r.totalAmount,
      roomType: r.roomType.nameKo,
      mvsBookingId: r.mvsBookingId,
      payments: r.payments.map((p) => ({
        id: p.id,
        status: p.status,
        amount: p.amount,
        provider: p.provider,
      })),
    },
  });
}
