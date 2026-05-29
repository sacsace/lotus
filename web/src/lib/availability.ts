import { prisma } from "@/lib/prisma";

/** 예약이 차지하는 객실 수(타입당 1실)로 가정 */
const BLOCKING = ["pending_payment", "confirmed"];

export async function overlappingReservationCount(
  roomTypeId: string,
  checkIn: Date,
  checkOut: Date,
): Promise<number> {
  return prisma.reservation.count({
    where: {
      roomTypeId,
      status: { in: BLOCKING },
      AND: [{ checkIn: { lt: checkOut } }, { checkOut: { gt: checkIn } }],
    },
  });
}

export async function availableUnitsForType(
  roomTypeId: string,
  inventory: number,
  checkIn: Date,
  checkOut: Date,
): Promise<number> {
  const used = await overlappingReservationCount(roomTypeId, checkIn, checkOut);
  return Math.max(0, inventory - used);
}
