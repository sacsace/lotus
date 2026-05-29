import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminTenant } from "@/lib/admin-api";

export default async function AdminAuditPage() {
  const tenant = await getAdminTenant();
  if (!tenant) redirect("/admin/pick-tenant");

  const logs = await prisma.auditLog.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { adminUser: { select: { name: true, email: true } } },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Audit Log</h1>
      <p className="mt-2 text-sm text-muted">Admin activity tracking for security compliance.</p>
      <div className="mt-8 overflow-x-auto rounded-2xl bg-card shadow-luxury">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-beige/50 text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Resource</th>
              <th className="px-4 py-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">No audit entries yet</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-beige/50">
                  <td className="px-4 py-3 text-xs text-muted">{log.createdAt.toLocaleString()}</td>
                  <td className="px-4 py-3">{log.adminUser?.name ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs">{log.action}</td>
                  <td className="px-4 py-3">{log.resource}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-xs text-muted">{log.details ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
