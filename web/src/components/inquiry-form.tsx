"use client";

import { useState } from "react";
import { useI18n } from "@/components/language-provider";

type Props = { tenantSlug: string };

export function InquiryForm({ tenantSlug }: Props) {
  const { t } = useI18n();
  const api = `/api/tenants/${encodeURIComponent(tenantSlug)}/inquiries`;
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [contact, setContact] = useState("");
  const [reservationCode, setReservationCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body, contact, reservationCode: reservationCode || undefined }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || t.inquiry.fail);
      setMsg(j.message || t.inquiry.success);
      setSubject("");
      setBody("");
      setContact("");
      setReservationCode("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : t.common.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <InquiryFields
        subject={subject}
        setSubject={setSubject}
        body={body}
        setBody={setBody}
        contact={contact}
        setContact={setContact}
        reservationCode={reservationCode}
        setReservationCode={setReservationCode}
        t={t}
      />
      {err && <p className="text-sm text-red-600">{err}</p>}
      {msg && <p className="text-sm text-emerald-700">{msg}</p>}
      <button type="submit" disabled={loading} className="w-full bg-[#1b1d1f] py-3 text-sm tracking-[0.14em] text-white disabled:opacity-60">
        {loading ? t.inquiry.submitting : t.inquiry.submit}
      </button>
    </form>
  );
}

function InquiryFields({
  subject,
  setSubject,
  body,
  setBody,
  contact,
  setContact,
  reservationCode,
  setReservationCode,
  t,
}: {
  subject: string;
  setSubject: (v: string) => void;
  body: string;
  setBody: (v: string) => void;
  contact: string;
  setContact: (v: string) => void;
  reservationCode: string;
  setReservationCode: (v: string) => void;
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium">{t.inquiry.subject}</label>
        <input className="mt-2 w-full border border-[#1b1d1f] bg-white px-3 py-2.5 text-sm outline-none" value={subject} onChange={(e) => setSubject(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium">{t.inquiry.body}</label>
        <textarea className="mt-2 min-h-[120px] w-full border border-[#1b1d1f] bg-white px-3 py-2.5 text-sm outline-none" value={body} onChange={(e) => setBody(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium">{t.inquiry.contact}</label>
        <input className="mt-2 w-full border border-[#1b1d1f] bg-white px-3 py-2.5 text-sm outline-none" value={contact} onChange={(e) => setContact(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium">{t.inquiry.reservationCode}</label>
        <input className="mt-2 w-full border border-[#1b1d1f] bg-white px-3 py-2.5 text-sm outline-none" value={reservationCode} onChange={(e) => setReservationCode(e.target.value)} placeholder="LKH-XXXXXXXX" />
      </div>
    </>
  );
}
