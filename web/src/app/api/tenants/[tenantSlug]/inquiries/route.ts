import { NextResponse } from "next/server";
import { sendInquiryMail } from "@/lib/inquiry-mail";
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

  try {
    await sendInquiryMail({
      subject: row.subject,
      body: row.body,
      contact: row.contact,
      reservationCode: row.reservationCode,
      // Tenant public contact (hello@hotellotus.in for lotus-india) is always included with defaults.
      extraRecipients: [tenant.email],
    });
  } catch {
    return NextResponse.json({ id: row.id, error: "메일을 보내지 못했습니다. 잠시 후 다시 시도해 주세요." }, { status: 502 });
  }

  return NextResponse.json({ id: row.id, message: "문의가 접수되었습니다." });
}
