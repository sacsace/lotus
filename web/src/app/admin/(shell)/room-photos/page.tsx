import { redirect } from "next/navigation";
import { RoomPhotosEditor } from "@/components/admin/room-photos-editor";
import { getAdminTenantSlug } from "@/lib/admin-api";

export default async function RoomPhotosAdminPage() {
  const tenantSlug = await getAdminTenantSlug();
  if (!tenantSlug) redirect("/admin/pick-tenant");

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">객실 사진</h1>
      <p className="mt-1 text-sm text-muted">객실 유형별 갤러리 사진을 업로드하고 순서를 바꾸거나 삭제합니다.</p>
      <div className="mt-6">
        <RoomPhotosEditor />
      </div>
    </div>
  );
}
