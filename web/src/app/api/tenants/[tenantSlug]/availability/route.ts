import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseDateOnly, nightsBetween } from "@/lib/dates";
import { availableUnitsForType } from "@/lib/availability";
import { fetchMvsAvailability } from "@/lib/mvs";
import { PUBLIC_ROOM_CODES, sortRoomTypes } from "@/lib/lotus-rooms";
import { getTenantBySlug } from "@/lib/tenant";

type Ctx = { params: Promise<{ tenantSlug: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const { tenantSlug } = await ctx.params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) {
    return NextResponse.json({ error: "알 수 없는 호텔(테넌트)입니다." }, { status: 404 });
  }

  const url = new URL(req.url);
  const checkInStr = url.searchParams.get("checkIn");
  const checkOutStr = url.searchParams.get("checkOut");
  if (!checkInStr || !checkOutStr) {
    return NextResponse.json({ error: "checkIn, checkOut 필요 (YYYY-MM-DD)" }, { status: 400 });
  }
  const checkIn = parseDateOnly(checkInStr);
  const checkOut = parseDateOnly(checkOutStr);
  if (!checkIn || !checkOut || checkOut <= checkIn) {
    return NextResponse.json({ error: "날짜가 올바르지 않습니다." }, { status: 400 });
  }

  const mvs = await fetchMvsAvailability({
    checkIn: checkInStr,
    checkOut: checkOutStr,
    mvsEnabled: tenant.mvsEnabled,
    mvsCompanyId: tenant.mvsCompanyId,
  });
  const nights = nightsBetween(checkIn, checkOut);
  const types = sortRoomTypes(
    await prisma.roomType.findMany({
      where: { tenantId: tenant.id, code: { in: [...PUBLIC_ROOM_CODES] } },
    }),
  );

  const rooms = await Promise.all(
    types.map(async (t) => {
      const localAvail = await availableUnitsForType(t.id, t.inventory, checkIn, checkOut);
      const mvsHint = mvs?.roomHints?.[t.code]?.available;
      return {
        id: t.id,
        code: t.code,
        nameKo: t.nameKo,
        description: t.description,
        baseRate: t.baseRate,
        nights,
        estimatedTotal: t.baseRate * nights,
        availableLocal: localAvail,
        mvsHint,
        mvsNote: mvs?.note,
        mvsSource: mvs?.source,
      };
    }),
  );

  return NextResponse.json({
    tenant: {
      slug: tenant.slug,
      nameKo: tenant.nameKo,
      mvsEnabled: tenant.mvsEnabled,
      mvsCompanyId: tenant.mvsCompanyId,
    },
    checkIn: checkInStr,
    checkOut: checkOutStr,
    nights,
    mvs,
    rooms,
  });
}
