import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantBySlug } from "@/lib/tenant";

type Ctx = { params: Promise<{ tenantSlug: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const { tenantSlug } = await ctx.params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) {
    return NextResponse.json({ error: "알 수 없는 호텔입니다." }, { status: 404 });
  }

  let body: {
    subject?: string;
    body?: string;
    contact?: string;
    reservationCode?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON 필요" }, { status: 400 });
  }
  if (!body.subject?.trim() || !body.body?.trim() || !body.contact?.trim()) {
    return NextResponse.json({ error: "제목, 내용, 연락처는 필수입니다." }, { status: 400 });
  }

  const row = await prisma.inquiry.create({
    data: {
      tenantId: tenant.id,
      subject: body.subject.trim(),
      body: body.body.trim(),
      contact: body.contact.trim(),
      reservationCode: body.reservationCode?.trim() || null,
    },
  });

  return NextResponse.json({ id: row.id, message: "문의가 접수되었습니다." });
}
