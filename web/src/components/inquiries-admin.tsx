"use client";

import { useEffect, useState } from "react";

type Inquiry = {
  id: string;
  subject: string;
  body: string;
  contact: string;
  reservationCode: string | null;
  status: string;
  adminNote: string | null;
  createdAt: string;
};

export function InquiriesAdmin() {
  const [rows, setRows] = useState<Inquiry[]>([]);
  const [tenantLabel, setTenantLabel] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    const res = await fetch("/api/admin/inquiries", { credentials: "include" });
    const j = await res.json();
    if (!res.ok) {
      if (res.status === 400 && j.error?.includes("tenant")) {
        window.location.href = "/admin/pick-tenant";
        return;
      }
      setErr(j.error || "???? ??");
      return;
    }
    setRows(j.inquiries ?? []);
    if (j.tenant) setTenantLabel(`${j.tenant.nameKo} ? /${j.tenant.slug}`);
  }

  useEffect(() => {
    void load();
  }, []);

  async function patch(id: string, status: string, adminNote: string) {
    setErr(null);
    const res = await fetch("/api/admin/inquiries", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, adminNote }),
    });
    const j = await res.json();
    if (!res.ok) {
      setErr(j.error || "?? ??");
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === id ? j.inquiry : r)));
  }

  return (
    <div className="space-y-4">
      {tenantLabel && <p className="text-sm text-muted">?? ??: {tenantLabel}</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}
      <ul className="space-y-4">
        {rows.map((r) => (
          <li key={r.id} className="apple-card p-4 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium">{r.subject}</p>
                <p className="text-xs text-muted">{new Date(r.createdAt).toLocaleString("ko-KR")}</p>
              </div>
              <select className="apple-input w-auto py-1.5" value={r.status} onChange={(e) => void patch(r.id, e.target.value, r.adminNote || "")}>
                <option value="new">new</option>
                <option value="in_progress">in_progress</option>
                <option value="closed">closed</option>
              </select>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-muted">{r.body}</p>
            <p className="mt-2 text-xs text-muted">???: {r.contact}</p>
            {r.reservationCode && <p className="text-xs text-muted">????: {r.reservationCode}</p>}
            <label className="mt-3 block text-xs font-medium text-muted">??? ??</label>
            <textarea
              className="apple-input mt-1 text-xs"
              rows={2}
              defaultValue={r.adminNote || ""}
              onBlur={(e) => {
                if ((e.target.value || "") !== (r.adminNote || "")) void patch(r.id, r.status, e.target.value);
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
