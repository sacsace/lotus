"use client";

import { useEffect, useState } from "react";

type RoomType = {
  id: string;
  code: string;
  nameKo: string;
  baseRate: number;
  inventory: number;
};

export function RatesEditor() {
  const [rows, setRows] = useState<RoomType[]>([]);
  const [tenantLabel, setTenantLabel] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function load() {
    setErr(null);
    const res = await fetch("/api/admin/rates", { credentials: "include" });
    const j = await res.json();
    if (!res.ok) {
      if (j.error === "NO_TENANT" && res.status === 400) {
        window.location.href = "/admin/pick-tenant";
        return;
      }
      setErr(j.error || "요금 정보를 불러오지 못했습니다.");
      return;
    }
    setRows(j.roomTypes ?? []);
    if (j.tenant) setTenantLabel(`${j.tenant.nameKo} · /${j.tenant.slug}`);
  }

  useEffect(() => {
    void load();
  }, []);

  async function save() {
    setErr(null);
    setSaved(false);
    const res = await fetch("/api/admin/rates", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        updates: rows.map((r) => ({ id: r.id, baseRate: r.baseRate, inventory: r.inventory, nameKo: r.nameKo })),
      }),
    });
    const j = await res.json();
    if (!res.ok) {
      setErr(j.error || "저장에 실패했습니다.");
      return;
    }
    setRows(j.roomTypes ?? []);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function remove(row: RoomType) {
    if (!window.confirm(`${row.nameKo} 객실 유형을 삭제할까요? 이 유형의 객실 호수도 함께 지워집니다.`)) return;
    setErr(null);
    const res = await fetch("/api/admin/rates", {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id }),
    });
    const j = await res.json();
    if (!res.ok) {
      setErr(j.error || "삭제하지 못했습니다.");
      return;
    }
    setRows(j.roomTypes ?? []);
  }

  function update(id: string, patch: Partial<RoomType>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  return (
    <div className="space-y-4">
      {tenantLabel && (
        <p className="rounded-xl bg-beige px-3 py-2 text-sm">
          현재 지점: <strong>{tenantLabel}</strong>
        </p>
      )}
      <p className="text-sm text-muted">
        객실별 1박 요금과 재고를 수정할 수 있습니다. 삭제하면 그 유형의 객실 호수도 함께 지워집니다. 예약이 있는 유형은 삭제되지 않습니다.
      </p>
      {err && <p className="text-sm text-red-600">{err}</p>}
      {saved && <p className="text-sm text-emerald-600">저장했습니다.</p>}
      <div className="overflow-x-auto apple-card">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-beige/50 text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-2">객실 코드</th>
              <th className="px-4 py-2">객실명</th>
              <th className="px-4 py-2">1박 요금 (₹)</th>
              <th className="px-4 py-2">재고</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border/50">
                <td className="px-4 py-2 font-mono text-xs">{r.code}</td>
                <td className="px-4 py-2">
                  <input
                    className="apple-input min-w-[8rem] py-1.5"
                    value={r.nameKo}
                    onChange={(e) => update(r.id, { nameKo: e.target.value })}
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    min={0}
                    className="apple-input w-28 py-1.5"
                    value={r.baseRate}
                    onChange={(e) => update(r.id, { baseRate: Number(e.target.value) || 0 })}
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    min={0}
                    className="apple-input w-20 py-1.5"
                    value={r.inventory}
                    onChange={(e) => update(r.id, { inventory: Number(e.target.value) || 0 })}
                  />
                </td>
                <td className="px-4 py-2">
                  <button type="button" onClick={() => void remove(r)} className="text-sm text-red-700">
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={() => void save()} className="rounded-lg bg-[#1b1d1f] px-5 py-2.5 text-sm text-white">
        저장
      </button>
    </div>
  );
}
