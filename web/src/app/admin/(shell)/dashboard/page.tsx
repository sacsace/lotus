import { redirect } from "next/navigation";
import { getAdminTenant } from "@/lib/admin-api";
import { DashboardOverviewLazy } from "@/components/dynamic-client";

export default async function AdminDashboardPage() {
  const tenant = await getAdminTenant();
  if (!tenant) redirect("/admin/pick-tenant");

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Operations Dashboard</h1>
      <p className="mt-2 text-sm text-muted">
        {tenant.nameKo} · {tenant.mvsEnabled ? `MVS company ${tenant.mvsCompanyId}` : "Local mode"}
      </p>
      <div className="mt-8">
        <DashboardOverviewLazy />
      </div>
    </div>
  );
}
