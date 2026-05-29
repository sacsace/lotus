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
  const rows = await prisma.inquiry.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ tenant: { slug: tenant.slug, nameKo: tenant.nameKo }, inquiries: rows });
}

export async function PATCH(req: Request) {
  if (!(await assertAdminCookie())) {
    return NextResponse.json({ error: "권한 없음" }, { status: 401 });
  }
  const tenant = await getAdminTenant();
  if (!tenant) {
    return NextResponse.json({ error: "테넌트를 먼저 선택하세요." }, { status: 400 });
  }

  let body: { id?: string; status?: string; adminNote?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON 필요" }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: "id 필요" }, { status: 400 });

  const existing = await prisma.inquiry.findFirst({
    where: { id: body.id, tenantId: tenant.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "문의 없음" }, { status: 404 });
  }

  const data: { status?: string; adminNote?: string } = {};
  if (body.status) data.status = body.status;
  if (body.adminNote !== undefined) data.adminNote = body.adminNote;
  const row = await prisma.inquiry.update({ where: { id: body.id }, data });
  return NextResponse.json({ inquiry: row });
}
