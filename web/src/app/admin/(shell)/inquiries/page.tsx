import { redirect } from "next/navigation";
import { getAdminTenant } from "@/lib/admin-api";
import { InquiriesAdminLazy } from "@/components/dynamic-client";

export default async function AdminInquiriesPage() {
  const tenant = await getAdminTenant();
  if (!tenant) redirect("/admin/pick-tenant");

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Inquiries</h1>
      <p className="mt-2 text-sm text-muted">{tenant.nameKo} guest contact submissions.</p>
      <div className="mt-8">
        <InquiriesAdminLazy />
      </div>
    </div>
  );
}
