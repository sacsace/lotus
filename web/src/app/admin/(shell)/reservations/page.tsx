import { prisma } from "@/lib/prisma";
import { getAdminTenant } from "@/lib/admin-api";
import { redirect } from "next/navigation";

export default async function AdminReservationsPage() {
  const tenant = await getAdminTenant();
  if (!tenant) redirect("/admin/pick-tenant");

  const list = await prisma.reservation.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: "desc" },
    take: 80,
    include: { roomType: true, payments: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">?? ?? ? {tenant.nameKo}</h1>
      <div className="mt-6 overflow-x-auto apple-card">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-beige/50 text-xs uppercase text-muted">
            <tr>
              <th className="px-3 py-2">??</th>
              <th className="px-3 py-2">??</th>
              <th className="px-3 py-2">??</th>
              <th className="px-3 py-2">??</th>
              <th className="px-3 py-2">??</th>
              <th className="px-3 py-2">??</th>
              <th className="px-3 py-2">MVS</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id} className="border-b border-border/50">
                <td className="px-3 py-2 font-mono text-xs">{r.publicCode}</td>
                <td className="px-3 py-2">
                  <div>{r.guestName}</div>
                  <div className="text-xs text-muted">{r.guestEmail}</div>
                </td>
                <td className="px-3 py-2 text-xs whitespace-nowrap">
                  {r.checkIn.toISOString().slice(0, 10)} ? {r.checkOut.toISOString().slice(0, 10)}
                </td>
                <td className="px-3 py-2">{r.roomType.nameKo}</td>
                <td className="px-3 py-2">{r.status}</td>
                <td className="px-3 py-2">{r.payments[0]?.status ?? "?"}</td>
                <td className="px-3 py-2 font-mono text-xs">{r.mvsBookingId ?? "?"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
