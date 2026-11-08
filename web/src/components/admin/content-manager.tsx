"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type HeroAsset = {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
  category: string;
};

export function ContentManager() {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [breakfastItems, setBreakfastItems] = useState("");
  const [dinnerItems, setDinnerItems] = useState("");
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementBody, setAnnouncementBody] = useState("");
  const [heroAssets, setHeroAssets] = useState<HeroAsset[]>([]);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/content");
    if (!res.ok) return;
    const data = await res.json();
    setPhone(data.tenant?.phone ?? "");
    setEmail(data.tenant?.email ?? "");
    setAddress(data.tenant?.address ?? "");
    setWhatsapp(data.tenant?.whatsapp ?? "");
    const breakfast = data.menus?.find((m: { mealType: string }) => m.mealType === "breakfast");
    const dinner = data.menus?.find((m: { mealType: string }) => m.mealType === "dinner");
    if (breakfast) setBreakfastItems(JSON.parse(breakfast.items).join("\n"));
    if (dinner) setDinnerItems(JSON.parse(dinner.items).join("\n"));
    const ann = data.announcements?.[0];
    if (ann) {
      setAnnouncementTitle(ann.title);
      setAnnouncementBody(ann.body);
    }
    const heroes: HeroAsset[] = (data.media ?? []).filter((m: HeroAsset) => m.category === "hero");
    setHeroAssets(heroes.sort((a, b) => a.sortOrder - b.sortOrder));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(type: string, payload: Record<string, unknown>) {
    await fetch("/api/admin/content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, ...payload }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const menuDate = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-8">
      {saved && <p className="rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-800">Saved successfully</p>}

      <HeroImagesSection
        assets={heroAssets}
        onChanged={() => {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
          void load();
        }}
      />

      <section className="rounded-2xl bg-card p-6 shadow-luxury">
        <h2 className="font-semibold">Contact Information</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="rounded-lg border px-3 py-2 text-sm" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="rounded-lg border px-3 py-2 text-sm" />
          <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="WhatsApp" className="rounded-lg border px-3 py-2 text-sm" />
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" className="rounded-lg border px-3 py-2 text-sm sm:col-span-2" />
        </div>
        <button type="button" onClick={() => void save("tenant", { phone, email, address, whatsapp })} className="mt-4 rounded-full bg-charcoal px-5 py-2 text-sm text-white dark:bg-gold dark:text-charcoal">
          Save contact
        </button>
      </section>

      <section className="rounded-2xl bg-card p-6 shadow-luxury">
        <h2 className="font-semibold">Daily Dining Menu</h2>
        <p className="mt-1 text-xs text-muted">One item per line</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Breakfast</label>
            <textarea value={breakfastItems} onChange={(e) => setBreakfastItems(e.target.value)} rows={6} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
            <button type="button" onClick={() => void save("menu", { mealType: "breakfast", menuDate, items: breakfastItems.split("\n").filter(Boolean) })} className="mt-2 text-sm text-gold hover:underline">Save breakfast</button>
          </div>
          <div>
            <label className="text-sm font-medium">Dinner</label>
            <textarea value={dinnerItems} onChange={(e) => setDinnerItems(e.target.value)} rows={6} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
            <button type="button" onClick={() => void save("menu", { mealType: "dinner", menuDate, items: dinnerItems.split("\n").filter(Boolean) })} className="mt-2 text-sm text-gold hover:underline">Save dinner</button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-card p-6 shadow-luxury" id="announcement-section">
        <h2 className="font-semibold">Announcement</h2>
        <input value={announcementTitle} onChange={(e) => setAnnouncementTitle(e.target.value)} placeholder="Title" className="mt-4 w-full rounded-lg border px-3 py-2 text-sm" />
        <textarea value={announcementBody} onChange={(e) => setAnnouncementBody(e.target.value)} rows={4} placeholder="Body" className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" />
        <button type="button" onClick={() => void save("announcement", { title: announcementTitle, body: announcementBody, active: true })} className="mt-4 rounded-full bg-charcoal px-5 py-2 text-sm text-white dark:bg-gold dark:text-charcoal">
          Save announcement
        </button>
      </section>
    </div>
  );
}

function HeroImagesSection({ assets, onChanged }: { assets: HeroAsset[]; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingAlt, setPendingAlt] = useState("Lotus Korean Hotel");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const replaceRef = useRef<HTMLInputElement | null>(null);
  const [replaceId, setReplaceId] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");

  async function uploadFile(file: File): Promise<string | null> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("category", "hero");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd, credentials: "include" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "업로드에 실패했습니다.");
      return null;
    }
    const data = await res.json();
    return data.url as string;
  }

  async function addHero(url: string, alt: string) {
    const res = await fetch("/api/admin/content", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "hero-add", url, alt }),
    });
    if (!res.ok) {
      setError("히어로 사진을 추가하지 못했습니다.");
      return false;
    }
    return true;
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    const url = await uploadFile(file);
    if (url) {
      const ok = await addHero(url, pendingAlt || file.name);
      if (ok) onChanged();
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
    setBusy(false);
  }

  async function handleAddByUrl() {
    if (!urlInput.trim()) return;
    setBusy(true);
    setError(null);
    const ok = await addHero(urlInput.trim(), pendingAlt || "Lotus Korean Hotel");
    if (ok) {
      setUrlInput("");
      onChanged();
    }
    setBusy(false);
  }

  async function handleUpdate(asset: HeroAsset, patch: Partial<Pick<HeroAsset, "alt" | "sortOrder" | "url">>) {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/content", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "hero-update", id: asset.id, ...patch }),
    });
    setBusy(false);
    if (!res.ok) {
      setError("수정에 실패했습니다.");
      return;
    }
    onChanged();
  }

  async function handleReplace(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !replaceId) return;
    const asset = assets.find((item) => item.id === replaceId);
    setBusy(true);
    setError(null);
    const url = await uploadFile(file);
    if (url && asset) {
      await handleUpdate(asset, { url });
    }
    setReplaceId(null);
    if (replaceRef.current) replaceRef.current.value = "";
    setBusy(false);
  }

  async function handleDelete(asset: HeroAsset) {
    if (!confirm("이 히어로 사진을 삭제할까요?")) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/content", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "hero-delete", id: asset.id }),
    });
    setBusy(false);
    if (!res.ok) {
      setError("삭제에 실패했습니다.");
      return;
    }
    onChanged();
  }

  return (
    <section className="rounded-2xl bg-card p-6 shadow-luxury">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold">히어로 이미지 (홈 슬라이드)</h2>
          <p className="mt-1 text-xs text-muted">
            홈 페이지 슬라이드에 표시됩니다. PNG / JPG / WebP, 최대 8MB. 순서가 작을수록 먼저 보입니다.
            사진 교체로 기존 이미지를 바꿀 수 있고, 설명·순서는 수정 후 포커스를 벗어나면 저장됩니다.
          </p>
        </div>
      </div>

      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {assets.length === 0 && (
          <p className="col-span-full rounded-lg bg-stone-50 p-6 text-center text-sm text-muted dark:bg-stone-900/30">
            등록된 히어로 사진이 없습니다. 기본 이미지가 공개 페이지에 표시됩니다.
          </p>
        )}
        {assets.map((asset, index) => (
          <div key={asset.id} className="flex flex-col overflow-hidden rounded-xl border bg-background">
            <div className="relative aspect-[16/9] w-full bg-stone-100">
              <Image src={asset.url} alt={asset.alt ?? ""} fill className="object-cover" sizes="400px" unoptimized />
              <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-[11px] text-white">
                {String(index + 1).padStart(2, "0")} / {String(assets.length).padStart(2, "0")}
              </span>
            </div>
            <div className="flex flex-col gap-2 p-3">
              <label className="text-[11px] uppercase tracking-wide text-muted">설명</label>
              <input
                defaultValue={asset.alt ?? ""}
                onBlur={(e) => {
                  if (e.target.value !== (asset.alt ?? "")) {
                    void handleUpdate(asset, { alt: e.target.value });
                  }
                }}
                className="rounded-lg border px-2 py-1 text-sm"
              />
              <div className="flex items-center gap-2">
                <label className="text-[11px] uppercase tracking-wide text-muted">순서</label>
                <input
                  type="number"
                  defaultValue={asset.sortOrder}
                  onBlur={(e) => {
                    const v = Number(e.target.value);
                    if (!Number.isNaN(v) && v !== asset.sortOrder) {
                      void handleUpdate(asset, { sortOrder: v });
                    }
                  }}
                  className="w-20 rounded-lg border px-2 py-1 text-sm"
                />
              </div>
              <div className="mt-1 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setReplaceId(asset.id);
                    replaceRef.current?.click();
                  }}
                  className="rounded-full border px-3 py-1 text-xs hover:bg-stone-50"
                >
                  사진 교체
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(asset)}
                  disabled={busy}
                  className="rounded-full border border-red-300 px-3 py-1 text-xs text-red-700 hover:bg-red-50"
                >
                  삭제
                </button>
              </div>
              <p className="break-all text-[11px] text-muted">{asset.url}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-3 rounded-xl border border-dashed bg-stone-50/50 p-4 dark:bg-stone-900/30">
        <p className="text-sm font-medium">히어로 사진 추가</p>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            value={pendingAlt}
            onChange={(e) => setPendingAlt(e.target.value)}
            placeholder="사진 설명"
            className="rounded-lg border bg-background px-3 py-2 text-sm"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            disabled={busy}
            onChange={handleFileChange}
            className="text-sm"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="또는 이미지 주소 붙여넣기 (예: /images/hotel/lobby-wide.png)"
            className="rounded-lg border bg-background px-3 py-2 text-sm"
          />
          <button
            type="button"
            disabled={busy || !urlInput.trim()}
            onClick={() => void handleAddByUrl()}
            className="rounded-lg bg-[#1b1d1f] px-5 py-2 text-sm text-white disabled:opacity-50"
          >
            주소로 추가
          </button>
        </div>
      </div>

      <input
        ref={replaceRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => void handleReplace(e)}
      />
    </section>
  );
}
