import nodemailer from "nodemailer";

/** Always included for booking / inquiry alerts. */
export const INQUIRY_RECIPIENTS = ["hello@hotellotus.in", "lee@msventures.in"] as const;

export type InquiryMailInput = {
  subject: string;
  body: string;
  contact: string;
  reservationCode?: string | null;
  /** Extra addresses (e.g. tenant contact email). */
  extraRecipients?: (string | null | undefined)[];
};

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isEmail(value: string) {
  return looksLikeEmail(value);
}

/** hello@ + lee@ + INQUIRY_TO env + any extras, de-duplicated. */
export function resolveInquiryRecipients(extra: (string | null | undefined)[] = []) {
  const fromEnv = (process.env.INQUIRY_TO ?? "")
    .split(/[,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
  const seen = new Set<string>();
  const list: string[] = [];
  for (const raw of [...INQUIRY_RECIPIENTS, ...fromEnv, ...extra]) {
    if (!raw || !isEmail(raw)) continue;
    const key = normalizeEmail(raw);
    if (seen.has(key)) continue;
    seen.add(key);
    list.push(raw.trim());
  }
  return list;
}

type MailField = { label: string; value: string };

function looksLikeEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function firstEmail(value: string, skip: Set<string>) {
  const matches = value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? [];
  return matches.map((item) => item.trim()).find((item) => !skip.has(item.toLowerCase())) ?? null;
}

export function guestReplyAddress(input: { subject: string; body: string; contact: string }) {
  const skip = new Set([process.env.SMTP_USER?.trim().toLowerCase() ?? ""]);
  const contact = input.contact.trim();
  if (looksLikeEmail(contact) && !skip.has(contact.toLowerCase())) return contact;
  return firstEmail(input.contact, skip) ?? firstEmail(input.subject, skip) ?? firstEmail(input.body, skip);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function splitMessage(body: string) {
  const fields: MailField[] = [];
  const notes: string[] = [];
  for (const line of body.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const match = trimmed.match(/^([^:\n]{1,24}):\s*(.*)$/);
    if (match) fields.push({ label: match[1].trim(), value: match[2].trim() || "-" });
    else notes.push(trimmed);
  }
  return fields.length >= 2 ? { fields, notes } : { fields: [], notes: [body.trim()].filter(Boolean) };
}

export function buildInquiryMessage(input: InquiryMailInput) {
  const replyTo = guestReplyAddress(input);
  const parsed = splitMessage(input.body);
  const fields: MailField[] = [];
  if (replyTo) fields.push({ label: "고객 메일", value: replyTo });
  if (input.contact.trim() && input.contact.trim() !== replyTo) fields.push({ label: "연락처", value: input.contact.trim() });
  if (input.reservationCode?.trim()) fields.push({ label: "예약 번호", value: input.reservationCode.trim() });
  fields.push(...parsed.fields);

  const text = [
    "LOTUS KOREAN HOTEL",
    input.subject.trim(),
    "",
    ...fields.map((field) => `${field.label}: ${field.value}`),
    ...parsed.notes.map((note) => `\n${note}`),
  ]
    .join("\n")
    .trim();

  const rows = fields
    .map(
      (field) => `<tr>
        <td style="padding:13px 36px;border-bottom:1px solid #e6ebed;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="128" valign="top" style="width:128px;font-family:Arial,sans-serif;font-size:12px;line-height:1.5;color:#8b9398;">${escapeHtml(field.label)}</td>
              <td valign="top" style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#1b1d1f;">${escapeHtml(field.value)}</td>
            </tr>
          </table>
        </td>
      </tr>`,
    )
    .join("");

  const note = parsed.notes
    .map(
      (item) =>
        `<p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:13px;line-height:1.6;color:#5e676c;">${escapeHtml(item)}</p>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="ko">
<body style="margin:0;padding:0;background:#d5dee3;">
  <div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(fields[0] ? `${fields[0].label}: ${fields[0].value}` : input.subject)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#d5dee3;">
    <tr>
      <td align="center" style="padding:28px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;">
          <tr>
            <td style="padding:32px 36px 18px;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;letter-spacing:2px;color:#8b9398;">LOTUS KOREAN HOTEL</p>
              <h1 style="margin:14px 0 0;font-family:Arial,sans-serif;font-size:28px;line-height:1.25;font-weight:700;color:#1b1d1f;">${escapeHtml(input.subject.trim())}</h1>
            </td>
          </tr>
          <tr><td style="padding:0 36px;"><div style="border-top:2px solid #1b1d1f;font-size:0;line-height:0;">&nbsp;</div></td></tr>
          ${rows}
          <tr>
            <td style="padding:20px 36px 32px;">${note}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { replyTo, text, html };
}

export async function sendInquiryMail(input: InquiryMailInput) {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!host || !user || !pass) {
    throw new Error("메일 서버 설정이 없습니다.");
  }

  const recipients = resolveInquiryRecipients(input.extraRecipients);
  if (recipients.length === 0) {
    throw new Error("문의 메일 수신자가 없습니다.");
  }

  const port = Number(process.env.SMTP_PORT || 587);
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass: pass.replace(/\s+/g, "") },
  });
  const fromName = process.env.SMTP_FROM_NAME?.trim() || "Lotus Korean hotel";
  const message = buildInquiryMessage(input);

  // Send one message per recipient so hello@ and lee@ are each attempted explicitly.
  const results = await Promise.allSettled(
    recipients.map((to) =>
      transporter.sendMail({
        from: { name: fromName, address: user },
        to,
        replyTo: message.replyTo ?? undefined,
        subject: input.subject,
        text: message.text,
        html: message.html,
      }),
    ),
  );

  const failed = recipients.filter((_, i) => results[i]?.status === "rejected");
  if (failed.length === recipients.length) {
    const first = results.find((r) => r.status === "rejected");
    const reason = first && first.status === "rejected" ? String(first.reason) : "unknown";
    throw new Error(`메일 전송 실패: ${reason}`);
  }
  if (failed.length > 0) {
    console.error(`[inquiry-mail] partial delivery failure: ${failed.join(", ")}`);
  }
}
