"use client";

import { useEffect, useState } from "react";

type Tenant = { id: string; slug: string; nameKo: string; mvsEnabled: boolean };

export function TenantPicker() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/admin/tenants", { credentials: "include" });
      const j = await res.json();
      if (!res.ok) {
        setErr(j.error || "Failed to load hotels");
        setLoading(false);
        return;
      }
      setTenants(j.tenants ?? []);
      setLoading(false);
    })();
  }, []);

  async function select(slug: string) {
    setErr(null);
    const res = await fetch("/api/admin/select-tenant", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    const j = await res.json();
    if (!res.ok) {
      setErr(j.error || "Selection failed");
      return;
    }
    window.location.href = "/admin/dashboard";
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Select Hotel</h1>
      <p className="mt-2 text-sm text-muted">
        Choose which property to manage. URL paths and MVS company_id map to each tenant.
      </p>
      {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
      {loading ? (
        <p className="mt-8 text-sm text-muted">Loading?</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {tenants.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => void select(t.slug)}
                className="apple-card w-full px-5 py-4 text-left transition hover:shadow-apple"
              >
                <p className="font-medium">{t.nameKo}</p>
                <p className="mt-1 font-mono text-xs text-muted">/{t.slug}</p>
                <p className="mt-1 text-xs text-muted">{t.mvsEnabled ? "MVS linked" : "Local only"}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
