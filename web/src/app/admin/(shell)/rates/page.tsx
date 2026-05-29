import { redirect } from "next/navigation";
import { getAdminTenant } from "@/lib/admin-api";
import { RatesEditorLazy } from "@/components/dynamic-client";

export default async function AdminRatesPage() {
  const tenant = await getAdminTenant();
  if (!tenant) redirect("/admin/pick-tenant");

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Rates</h1>
      <p className="mt-2 text-sm text-muted">{tenant.nameKo} room pricing and inventory.</p>
      <div className="mt-8">
        <RatesEditorLazy />
      </div>
    </div>
  );
}
