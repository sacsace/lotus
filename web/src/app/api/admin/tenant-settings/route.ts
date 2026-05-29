import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertAdminCookie, getAdminTenant } from "@/lib/admin-api";

export async function GET() {
  if (!(await assertAdminCookie())) {
    return NextResponse.json({ error: "권한 없음" }, { status: 401 });
  }
  const tenant = await getAdminTenant();
  if (!tenant) {
    return NextResponse.json({ error: "테넌트를 먼저 선택하세요." }, { status: 400 });
  }
  return NextResponse.json({
    tenant: {
      slug: tenant.slug,
      nameKo: tenant.nameKo,
      mvsEnabled: tenant.mvsEnabled,
      mvsCompanyId: tenant.mvsCompanyId,
    },
  });
}

export async function PATCH(req: Request) {
  if (!(await assertAdminCookie())) {
    return NextResponse.json({ error: "권한 없음" }, { status: 401 });
  }
  const tenant = await getAdminTenant();
  if (!tenant) {
    return NextResponse.json({ error: "테넌트를 먼저 선택하세요." }, { status: 400 });
  }

  let body: { mvsEnabled?: boolean; mvsCompanyId?: number | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON 필요" }, { status: 400 });
  }

  const data: { mvsEnabled?: boolean; mvsCompanyId?: number | null } = {};
  if (typeof body.mvsEnabled === "boolean") data.mvsEnabled = body.mvsEnabled;
  if (body.mvsCompanyId === null) data.mvsCompanyId = null;
  if (typeof body.mvsCompanyId === "number" && body.mvsCompanyId > 0) {
    data.mvsCompanyId = Math.floor(body.mvsCompanyId);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "변경할 값이 없습니다." }, { status: 400 });
  }

  const updated = await prisma.tenant.update({
    where: { id: tenant.id },
    data,
    select: { slug: true, nameKo: true, mvsEnabled: true, mvsCompanyId: true },
  });

  return NextResponse.json({ ok: true, tenant: updated });
}
