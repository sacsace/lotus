import { redirect } from "next/navigation";
import { getAdminTenant } from "@/lib/admin-api";
import { TenantSettingsFormLazy } from "@/components/dynamic-client";

export default async function AdminTenantSettingsPage() {
  const tenant = await getAdminTenant();
  if (!tenant) redirect("/admin/pick-tenant");

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">지점 설정</h1>
      <p className="mt-2 text-sm text-muted">{tenant.nameKo}의 MVS 연동 및 회사 정보 설정입니다.</p>
      <div className="mt-8 max-w-xl">
        <TenantSettingsFormLazy />
      </div>
    </div>
  );
}
