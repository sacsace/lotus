import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/admin-api";
import { maskPassport } from "@/lib/masking";

export async function GET(req: Request) {
  const session = await requirePermission("guests:view");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const slug = (await import("next/headers")).cookies;
  const jar = await slug();
  const tenantSlug = jar.get("lotus_admin_tenant")?.value;
  if (!tenantSlug) return NextResponse.json({ error: "No tenant" }, { status: 400 });

  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const status = searchParams.get("cFormStatus");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = {
    tenantId: tenant.id,
    ...(q
      ? {
          OR: [
            { guestName: { contains: q } },
            { companyName: { contains: q } },
            { roomNumber: { contains: q } },
            { email: { contains: q } },
          ],
        }
      : {}),
    ...(status ? { cFormStatus: status } : {}),
  };

  const [guests, total] = await Promise.all([
    prisma.guest.findMany({
      where,
      orderBy: { checkIn: "desc" },
      skip,
      take: limit,
      include: { room: { select: { roomNumber: true } } },
    }),
    prisma.guest.count({ where }),
  ]);

  return NextResponse.json({
    guests: guests.map((g) => ({
      ...g,
      passportMasked: maskPassport(g.passportNumber),
      passportNumber: undefined,
    })),
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}

export async function PATCH(req: Request) {
  const session = await requirePermission("guests:edit");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const guest = await prisma.guest.update({ where: { id }, data });
  return NextResponse.json({ ok: true, id: guest.id });
}
