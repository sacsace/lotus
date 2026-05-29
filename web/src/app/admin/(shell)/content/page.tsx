import { redirect } from "next/navigation";
import { getAdminTenant } from "@/lib/admin-api";
import { ContentManagerLazy } from "@/components/dynamic-client";

export default async function AdminContentPage() {
  const tenant = await getAdminTenant();
  if (!tenant) redirect("/admin/pick-tenant");

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Content Management</h1>
      <p className="mt-2 text-sm text-muted">Manage hero slider images, contact info, daily dining menus, and announcements.</p>
      <div className="mt-8">
        <ContentManagerLazy />
      </div>
    </div>
  );
}
