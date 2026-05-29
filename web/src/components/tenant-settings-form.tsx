"use client";

import { useEffect, useState } from "react";

type TenantSettings = {
  slug: string;
  nameKo: string;
  mvsEnabled: boolean;
  mvsCompanyId: number | null;
};

export function TenantSettingsForm() {
  const [tenant, setTenant] = useState<TenantSettings | null>(null);
  const [mvsEnabled, setMvsEnabled] = useState(false);
  const [companyIdInput, setCompanyIdInput] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/admin/tenant-settings", { credentials: "include" });
      const j = await res.json();
      if (!res.ok) {
        if (res.status === 400) {
          window.location.href = "/admin/pick-tenant";
          return;
        }
        setErr(j.error || "??? ???? ?????.");
        return;
      }
      setTenant(j.tenant);
      setMvsEnabled(Boolean(j.tenant?.mvsEnabled));
      setCompanyIdInput(j.tenant?.mvsCompanyId ? String(j.tenant.mvsCompanyId) : "");
    })();
  }, []);

  async function save() {
    setErr(null);
    setMsg(null);
    setSaving(true);
    try {
      const parsed = companyIdInput.trim() ? Number(companyIdInput) : null;
      if (parsed !== null && (!Number.isFinite(parsed) || parsed <= 0)) {
        throw new Error("?? ??? 1 ??? ???? ???.");
      }
      const res = await fetch("/api/admin/tenant-settings", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mvsEnabled, mvsCompanyId: parsed }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "?? ??");
      setTenant(j.tenant);
      setMsg("???????.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "??");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="apple-card space-y-4 p-6">
      {tenant && (
        <p className="text-sm text-muted">
          ?? ??: <strong className="text-foreground">{tenant.nameKo}</strong>{" "}
          <span className="font-mono text-xs">/{tenant.slug}</span>
        </p>
      )}
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={mvsEnabled} onChange={(e) => setMvsEnabled(e.target.checked)} />
        MVS ?? ??
      </label>
      <div>
        <label className="block text-sm font-medium">MVS ?? ?? (company_id)</label>
        <input
          type="number"
          min={1}
          className="apple-input mt-1"
          value={companyIdInput}
          onChange={(e) => setCompanyIdInput(e.target.value)}
          placeholder={mvsEnabled ? "?: 1" : "????? ?????"}
        />
      </div>
      <p className="text-xs text-muted">
        MVS ?? OFF ??? ?? ??? ?? ??? ? ??? ?? DB? ??? ????? ?????.
      </p>
      {err && <p className="text-sm text-red-600">{err}</p>}
      {msg && <p className="text-sm text-emerald-600">{msg}</p>}
      <button type="button" onClick={() => void save()} disabled={saving} className="apple-btn-primary disabled:opacity-60">
        {saving ? "?? ??" : "?? ??"}
      </button>
    </div>
  );
}
