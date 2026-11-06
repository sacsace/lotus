import { redirect } from "next/navigation";
import { getAdminTenant } from "@/lib/admin-api";
import { MenuEditor } from "@/components/admin/menu-editor";

export default async function AdminMenuPage() {
  const tenant = await getAdminTenant();
  if (!tenant) redirect("/admin/pick-tenant");

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">메뉴 관리</h1>
      <p className="mt-2 text-sm text-muted">한식 페이지에 보이는 메뉴 이름과 가격을 수정합니다. 저장하면 공개 페이지에 반영됩니다.</p>
      <div className="mt-8">
        <MenuEditor />
      </div>
    </div>
  );
}
