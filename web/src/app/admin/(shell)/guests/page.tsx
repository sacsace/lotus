import { redirect } from "next/navigation";
import { getAdminTenant } from "@/lib/admin-api";
import { GuestManagementLazy } from "@/components/dynamic-client";

export default async function AdminGuestsPage() {
  const tenant = await getAdminTenant();
  if (!tenant) redirect("/admin/pick-tenant");

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Guest Management</h1>
      <p className="mt-2 text-sm text-muted">Passport numbers masked by default. Sync from MVS on dashboard.</p>
      <div className="mt-8">
        <GuestManagementLazy />
      </div>
    </div>
  );
}
