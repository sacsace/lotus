import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertAdminCookie, getAdminTenant } from "@/lib/admin-api";

export async function GET() {
  if (!(await assertAdminCookie())) {
    return NextResponse.json({ error: "권한 없음" }, { status: 401 });
  }
  const tenant = await getAdminTenant();
  if (!tenant) {
    return NextResponse.json({ error: "테넌트를 먼저 선택하세요." }, { status: 400 });
  }
  const list = await prisma.reservation.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { roomType: true, payments: true },
  });
  return NextResponse.json({
    tenant: { slug: tenant.slug, nameKo: tenant.nameKo },
    reservations: list.map((r) => ({
      id: r.id,
      publicCode: r.publicCode,
      guestName: r.guestName,
      guestEmail: r.guestEmail,
      guestPhone: r.guestPhone,
      checkIn: r.checkIn.toISOString().slice(0, 10),
      checkOut: r.checkOut.toISOString().slice(0, 10),
      guests: r.guests,
      status: r.status,
      totalAmount: r.totalAmount,
      roomType: r.roomType.nameKo,
      mvsBookingId: r.mvsBookingId,
      createdAt: r.createdAt.toISOString(),
      paymentStatus: r.payments[0]?.status ?? null,
    })),
  });
}
