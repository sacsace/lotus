"use client";

import { useCallback, useEffect, useState } from "react";

type Guest = {
  id: string;
  guestName: string;
  companyName: string | null;
  roomNumber: string | null;
  checkIn: string;
  checkOut: string;
  nationality: string | null;
  passportMasked: string;
  visaNumber: string | null;
  phone: string | null;
  email: string | null;
  airportPickupStatus: string;
  mealOption: string | null;
  cFormStatus: string;
  notes: string | null;
};

export function GuestManagement() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [q, setQ] = useState("");
  const [cFormStatus, setCFormStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (q) params.set("q", q);
    if (cFormStatus) params.set("cFormStatus", cFormStatus);
    const res = await fetch(`/api/admin/guests?${params}`);
    if (res.ok) {
      const data = await res.json();
      setGuests(data.guests);
      setPages(data.pages);
    }
    setLoading(false);
  }, [page, q, cFormStatus]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          placeholder="Search guests…"
          className="apple-input max-w-xs py-2"
        />
        <select
          value={cFormStatus}
          onChange={(e) => { setCFormStatus(e.target.value); setPage(1); }}
          className="rounded-lg border border-beige bg-card px-3 py-2 text-sm"
        >
          <option value="">All C-Form status</option>
          <option value="pending">Pending</option>
          <option value="submitted">Submitted</option>
          <option value="verified">Verified</option>
        </select>
        <button
          type="button"
          onClick={() => { window.location.href = "/api/admin/guests/export"; }}
          className="rounded-lg bg-gold px-4 py-2 text-sm font-medium text-charcoal"
        >
          Export Excel (CSV)
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-card shadow-luxury">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-beige bg-beige/50 text-xs uppercase tracking-wide text-muted dark:bg-charcoal/30">
            <tr>
              <th className="px-4 py-3">Guest</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Room</th>
              <th className="px-4 py-3">Stay</th>
              <th className="px-4 py-3">Passport</th>
              <th className="px-4 py-3">Pickup</th>
              <th className="px-4 py-3">C-Form</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted">Loading…</td></tr>
            ) : guests.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted">No guests found</td></tr>
            ) : (
              guests.map((g) => (
                <tr key={g.id} className="border-b border-beige/50 hover:bg-beige/30 dark:hover:bg-charcoal/20">
                  <td className="px-4 py-3 font-medium">{g.guestName}</td>
                  <td className="px-4 py-3 text-muted">{g.companyName ?? "—"}</td>
                  <td className="px-4 py-3">{g.roomNumber ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {new Date(g.checkIn).toLocaleDateString()} – {new Date(g.checkOut).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button type="button" className="text-xs text-gold" onClick={() => setRevealed((r) => ({ ...r, [g.id]: !r[g.id] }))}>
                      {revealed[g.id] ? "Hide" : "Show"}
                    </button>
                    <span className="ml-2 font-mono text-xs">{g.passportMasked}</span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge value={g.airportPickupStatus} /></td>
                  <td className="px-4 py-3"><StatusBadge value={g.cFormStatus} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-center gap-2">
        <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded px-3 py-1 text-sm disabled:opacity-40">Prev</button>
        <span className="text-sm text-muted">Page {page} / {pages}</span>
        <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="rounded px-3 py-1 text-sm disabled:opacity-40">Next</button>
      </div>
    </div>
  );
}

function StatusBadge({ value }: { value: string }) {
  const colors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    completed: "bg-emerald-100 text-emerald-800",
    verified: "bg-emerald-100 text-emerald-800",
    submitted: "bg-blue-100 text-blue-800",
    assigned: "bg-blue-100 text-blue-800",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[value] ?? "bg-stone-100 text-stone-700"}`}>
      {value}
    </span>
  );
}
