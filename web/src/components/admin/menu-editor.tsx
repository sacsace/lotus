"use client";

import { useCallback, useEffect, useState } from "react";
import { HANSIK_MENU, type HansikMenuSection } from "@/lib/hansik-menu";

function cloneMenu(sections: HansikMenuSection[]): HansikMenuSection[] {
  return sections.map((section, index) => ({
    index: String(index + 1).padStart(2, "0"),
    title: section.title,
    wide: Boolean(section.wide),
    items: section.items.map((item) => ({ name: item.name, price: item.price })),
  }));
}

export function MenuEditor() {
  const [sections, setSections] = useState<HansikMenuSection[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/menu", { credentials: "include" });
    if (res.status === 400) {
      window.location.href = "/admin/pick-tenant";
      return;
    }
    if (!res.ok) {
      setError("메뉴를 불러오지 못했습니다.");
      return;
    }
    const data = await res.json();
    setSections(cloneMenu(Array.isArray(data.sections) ? data.sections : HANSIK_MENU));
    setReady(true);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function renumber(next: HansikMenuSection[]) {
    setSections(cloneMenu(next));
  }

  function updateSection(index: number, patch: Partial<HansikMenuSection>) {
    renumber(sections.map((section, i) => (i === index ? { ...section, ...patch } : section)));
  }

  function updateItem(sectionIndex: number, itemIndex: number, field: "name" | "price", value: string) {
    renumber(
      sections.map((section, i) =>
        i === sectionIndex
          ? {
              ...section,
              items: section.items.map((item, j) => (j === itemIndex ? { ...item, [field]: value } : item)),
            }
          : section,
      ),
    );
  }

  function moveSection(index: number, step: number) {
    const target = index + step;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    const [row] = next.splice(index, 1);
    next.splice(target, 0, row);
    renumber(next);
  }

  function moveItem(sectionIndex: number, itemIndex: number, step: number) {
    const items = [...sections[sectionIndex].items];
    const target = itemIndex + step;
    if (target < 0 || target >= items.length) return;
    const [row] = items.splice(itemIndex, 1);
    items.splice(target, 0, row);
    updateSection(sectionIndex, { items });
  }

  async function save(next = sections) {
    setBusy(true);
    setError("");
    setMessage("");
    const res = await fetch("/api/admin/menu", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sections: next }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "저장하지 못했습니다.");
      return;
    }
    const data = await res.json();
    setSections(cloneMenu(data.sections ?? next));
    setMessage("저장했습니다. 한식 페이지에 반영됩니다.");
  }

  if (!ready && !error) return <p className="text-sm text-muted">메뉴를 불러오는 중입니다.</p>;

  return (
    <div className="space-y-6">
      {message ? <p className="rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-800">{message}</p> : null}
      {error ? <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p> : null}

      {sections.map((section, sectionIndex) => (
        <section key={`${section.index}-${sectionIndex}`} className="rounded-2xl bg-card p-6 shadow-luxury">
          <div className="flex flex-wrap items-center gap-3">
            <span className="w-8 text-sm text-muted">{section.index}</span>
            <input
              value={section.title}
              onChange={(e) => updateSection(sectionIndex, { title: e.target.value })}
              aria-label="분류 이름"
              className="min-w-40 flex-1 rounded-lg border px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={Boolean(section.wide)}
                onChange={(e) => updateSection(sectionIndex, { wide: e.target.checked })}
              />
              두 열
            </label>
            <button type="button" onClick={() => moveSection(sectionIndex, -1)} className="text-sm text-muted">
              위로
            </button>
            <button type="button" onClick={() => moveSection(sectionIndex, 1)} className="text-sm text-muted">
              아래로
            </button>
            <button
              type="button"
              onClick={() => renumber(sections.filter((_, i) => i !== sectionIndex))}
              className="text-sm text-red-700"
            >
              분류 삭제
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {section.items.map((item, itemIndex) => (
              <div key={`${sectionIndex}-${itemIndex}`} className="flex flex-wrap items-center gap-2">
                <input
                  value={item.name}
                  onChange={(e) => updateItem(sectionIndex, itemIndex, "name", e.target.value)}
                  aria-label="메뉴 이름"
                  className="min-w-48 flex-1 rounded-lg border px-3 py-2 text-sm"
                />
                <input
                  value={item.price}
                  onChange={(e) => updateItem(sectionIndex, itemIndex, "price", e.target.value)}
                  aria-label="가격"
                  className="w-40 rounded-lg border px-3 py-2 text-sm"
                />
                <button type="button" onClick={() => moveItem(sectionIndex, itemIndex, -1)} className="text-sm text-muted">
                  위
                </button>
                <button type="button" onClick={() => moveItem(sectionIndex, itemIndex, 1)} className="text-sm text-muted">
                  아래
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateSection(sectionIndex, { items: section.items.filter((_, i) => i !== itemIndex) })
                  }
                  className="text-sm text-red-700"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => updateSection(sectionIndex, { items: [...section.items, { name: "", price: "" }] })}
            className="mt-3 text-sm text-gold"
          >
            메뉴 추가
          </button>
        </section>
      ))}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => renumber([...sections, { index: "", title: "새 분류", items: [{ name: "", price: "" }] }])}
          className="rounded-full border px-5 py-2 text-sm"
        >
          분류 추가
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void save()}
          className="rounded-full bg-charcoal px-5 py-2 text-sm text-white disabled:opacity-50 dark:bg-gold dark:text-charcoal"
        >
          저장
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            const next = cloneMenu(HANSIK_MENU);
            setSections(next);
            void save(next);
          }}
          className="rounded-full border px-5 py-2 text-sm"
        >
          기본 메뉴로 되돌리기
        </button>
      </div>
    </div>
  );
}
