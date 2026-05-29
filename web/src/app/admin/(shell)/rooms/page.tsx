import { redirect } from "next/navigation";
import { getAdminTenant } from "@/lib/admin-api";
import { RoomGridLazy } from "@/components/dynamic-client";

export default async function AdminRoomsPage() {
  const tenant = await getAdminTenant();
  if (!tenant) redirect("/admin/pick-tenant");

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Room Management</h1>
      <p className="mt-2 text-sm text-muted">Visual room grid — occupancy, cleaning, and maintenance status.</p>
      <div className="mt-8">
        <RoomGridLazy />
      </div>
    </div>
  );
}
