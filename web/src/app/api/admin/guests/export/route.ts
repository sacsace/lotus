import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/admin-api";
import { maskPassport } from "@/lib/masking";

export async function GET() {
  const session = await requirePermission("guests:export");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const jar = await (await import("next/headers")).cookies();
  const tenantSlug = jar.get("lotus_admin_tenant")?.value;
  if (!tenantSlug) return NextResponse.json({ error: "No tenant" }, { status: 400 });

  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const guests = await prisma.guest.findMany({ where: { tenantId: tenant.id }, orderBy: { checkIn: "desc" } });

  const headers = [
    "Guest Name",
    "Company",
    "Room",
    "Check-in",
    "Check-out",
    "Nationality",
    "Passport",
    "Visa",
    "Phone",
    "Email",
    "Pickup",
    "Meal",
    "C-Form",
    "Notes",
  ];

  const rows = guests.map((g) =>
    [
      g.guestName,
      g.companyName ?? "",
      g.roomNumber ?? "",
      g.checkIn.toISOString().slice(0, 10),
      g.checkOut.toISOString().slice(0, 10),
      g.nationality ?? "",
      maskPassport(g.passportNumber),
      g.visaNumber ?? "",
      g.phone ?? "",
      g.email ?? "",
      g.airportPickupStatus,
      g.mealOption ?? "",
      g.cFormStatus,
      (g.notes ?? "").replace(/"/g, '""'),
    ]
      .map((v) => `"${v}"`)
      .join(","),
  );

  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="guests-${tenant.slug}.csv"`,
    },
  });
}
