"use client";

import { useState } from "react";
import { useI18n } from "@/components/language-provider";

type Props = { tenantSlug: string };

export function ReservationLookup({ tenantSlug }: Props) {
  const { t } = useI18n();
  const api = `/api/tenants/${encodeURIComponent(tenantSlug)}/reservations/lookup`;
  const [publicCode, setPublicCode] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setData(null);
    setLoading(true);
    try {
      const res = await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicCode, guestEmail }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || t.reservationLookup.fail);
      setData(j.reservation as Record<string, unknown>);
    } catch (e) {
      setErr(e instanceof Error ? e.message : t.common.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <div>
          <label className="text-sm font-medium text-stone-700">{t.reservationLookup.code}</label>
          <input
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 uppercase"
            value={publicCode}
            onChange={(e) => setPublicCode(e.target.value)}
            placeholder="LKH-XXXXXXXX"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">{t.reservationLookup.email}</label>
          <input
            type="email"
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            required
          />
        </div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-stone-900 py-2.5 text-sm font-medium text-white hover:bg-stone-800"
        >
          {loading ? t.reservationLookup.submitting : t.reservationLookup.submit}
        </button>
      </form>
      {data && (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-6 text-sm text-stone-800">
          <dl className="grid gap-2 sm:grid-cols-2">
            {Object.entries(data).map(([k, v]) => (
              <div key={k} className="sm:col-span-2">
                <dt className="text-xs uppercase text-stone-500">{k}</dt>
                <dd className="font-mono text-sm break-all">
                  {typeof v === "object" ? JSON.stringify(v) : String(v)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}
