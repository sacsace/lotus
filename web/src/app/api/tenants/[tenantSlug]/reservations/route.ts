import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseDateOnly, nightsBetween } from "@/lib/dates";
import { generatePublicCode } from "@/lib/codes";
import { availableUnitsForType } from "@/lib/availability";
import { getTenantBySlug } from "@/lib/tenant";

type Ctx = { params: Promise<{ tenantSlug: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const { tenantSlug } = await ctx.params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) {
    return NextResponse.json({ error: "알 수 없는 호텔입니다." }, { status: 404 });
  }

  let body: {
    guestName?: string;
    guestEmail?: string;
    guestPhone?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    roomTypeId?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON 본문이 필요합니다." }, { status: 400 });
  }

  const { guestName, guestEmail, guestPhone, checkIn: cis, checkOut: cos, guests, roomTypeId } =
    body;
  if (!guestName?.trim() || !guestEmail?.trim() || !cis || !cos || !roomTypeId) {
    return NextResponse.json({ error: "필수 필드 누락" }, { status: 400 });
  }
  const checkIn = parseDateOnly(cis);
  const checkOut = parseDateOnly(cos);
  if (!checkIn || !checkOut || checkOut <= checkIn) {
    return NextResponse.json({ error: "날짜 오류" }, { status: 400 });
  }
  const g = Math.min(6, Math.max(1, guests ?? 1));

  const roomType = await prisma.roomType.findFirst({
    where: { id: roomTypeId, tenantId: tenant.id },
  });
  if (!roomType) {
    return NextResponse.json({ error: "객실 타입 없음" }, { status: 404 });
  }

  const avail = await availableUnitsForType(roomType.id, roomType.inventory, checkIn, checkOut);
  if (avail < 1) {
    return NextResponse.json({ error: "해당 기간에 객실이 없습니다." }, { status: 409 });
  }

  const nights = nightsBetween(checkIn, checkOut);
  const totalAmount = roomType.baseRate * nights;

  let publicCode = generatePublicCode();
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.reservation.findUnique({ where: { publicCode } });
    if (!exists) break;
    publicCode = generatePublicCode();
  }

  const reservation = await prisma.$transaction(async (tx) => {
    const r = await tx.reservation.create({
      data: {
        tenantId: tenant.id,
        publicCode,
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim().toLowerCase(),
        guestPhone: guestPhone?.trim() || null,
        checkIn,
        checkOut,
        guests: g,
        roomTypeId: roomType.id,
        status: "pending_payment",
        totalAmount,
      },
    });
    await tx.payment.create({
      data: {
        reservationId: r.id,
        provider: "mock",
        amount: totalAmount,
        status: "pending",
      },
    });
    return r;
  });

  return NextResponse.json({
    id: reservation.id,
    publicCode: reservation.publicCode,
    status: reservation.status,
    totalAmount: reservation.totalAmount,
    tenantSlug: tenant.slug,
    message: "결제 단계로 진행해 주세요. (데모: 내 예약에서 결제 시뮬레이션 가능)",
  });
}
