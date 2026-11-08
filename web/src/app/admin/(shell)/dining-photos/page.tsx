import { redirect } from "next/navigation";
import { DiningPhotosEditor } from "@/components/admin/dining-photos-editor";
import { getAdminTenantSlug } from "@/lib/admin-api";

export default async function DiningPhotosAdminPage() {
  const tenantSlug = await getAdminTenantSlug();
  if (!tenantSlug) redirect("/admin/pick-tenant");

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">한식 사진</h1>
      <p className="mt-1 text-sm text-muted">다이닝 갤러리 사진을 업로드하고 순서를 바꾸거나 삭제합니다.</p>
      <div className="mt-6">
        <DiningPhotosEditor />
      </div>
    </div>
  );
}
