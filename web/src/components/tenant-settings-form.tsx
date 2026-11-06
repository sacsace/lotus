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
        setErr(j.error || "설정을 불러오지 못했습니다.");
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
        throw new Error("회사 ID는 0보다 큰 숫자여야 합니다.");
      }
      const res = await fetch("/api/admin/tenant-settings", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mvsEnabled, mvsCompanyId: parsed }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "저장에 실패했습니다.");
      setTenant(j.tenant);
      setMsg("저장했습니다.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="apple-card space-y-4 p-6">
      {tenant && (
        <p className="text-sm text-muted">
          현재 지점: <strong className="text-foreground">{tenant.nameKo}</strong>{" "}
          <span className="font-mono text-xs">/{tenant.slug}</span>
        </p>
      )}
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={mvsEnabled} onChange={(e) => setMvsEnabled(e.target.checked)} />
        MVS 연동 사용
      </label>
      <div>
        <label className="block text-sm font-medium">MVS 회사 ID (company_id)</label>
        <input
          type="number"
          min={1}
          className="apple-input mt-1"
          value={companyIdInput}
          onChange={(e) => setCompanyIdInput(e.target.value)}
          placeholder={mvsEnabled ? "예: 1" : "연동 사용 시 필수"}
        />
      </div>
      <p className="text-xs text-muted">
        MVS 연동을 끄면 예약 정보가 외부로 전송되지 않고 이 사이트의 데이터베이스에만 저장됩니다.
      </p>
      {err && <p className="text-sm text-red-600">{err}</p>}
      {msg && <p className="text-sm text-emerald-600">{msg}</p>}
      <button type="button" onClick={() => void save()} disabled={saving} className="apple-btn-primary disabled:opacity-60">
        {saving ? "저장 중…" : "설정 저장"}
      </button>
    </div>
  );
}
