import { redirect } from "next/navigation";
import { getAdminTenant } from "@/lib/admin-api";
import { TenantSettingsFormLazy } from "@/components/dynamic-client";

export default async function AdminTenantSettingsPage() {
  const tenant = await getAdminTenant();
  if (!tenant) redirect("/admin/pick-tenant");

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Tenant Settings</h1>
      <p className="mt-2 text-sm text-muted">MVS integration and company mapping for {tenant.nameKo}.</p>
      <div className="mt-8 max-w-xl">
        <TenantSettingsFormLazy />
      </div>
    </div>
  );
}
