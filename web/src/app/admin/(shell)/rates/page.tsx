import { redirect } from "next/navigation";
import { getAdminTenant } from "@/lib/admin-api";
import { RatesEditorLazy } from "@/components/dynamic-client";

export default async function AdminRatesPage() {
  const tenant = await getAdminTenant();
  if (!tenant) redirect("/admin/pick-tenant");

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">요금 관리</h1>
      <p className="mt-2 text-sm text-muted">{tenant.nameKo}의 객실 요금과 재고를 관리합니다.</p>
      <div className="mt-8">
        <RatesEditorLazy />
      </div>
    </div>
  );
}
