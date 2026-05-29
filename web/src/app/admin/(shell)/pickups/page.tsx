import { redirect } from "next/navigation";
import { getAdminTenant } from "@/lib/admin-api";
import { PickupManagerLazy } from "@/components/dynamic-client";

export default async function AdminPickupsPage() {
  const tenant = await getAdminTenant();
  if (!tenant) redirect("/admin/pick-tenant");

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Airport Pickup Management</h1>
      <p className="mt-2 text-sm text-muted">Flight tracking, driver assignment, and pickup status.</p>
      <div className="mt-8">
        <PickupManagerLazy />
      </div>
    </div>
  );
}
