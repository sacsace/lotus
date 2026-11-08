"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type RoomType = { id: string; code: string; nameKo: string; imageUrl: string | null };
type PhotoAsset = {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
  category: string;
};

export function RoomPhotosEditor() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [photos, setPhotos] = useState<Record<string, PhotoAsset[]>>({});
  const [tenantLabel, setTenantLabel] = useState("");
  const [activeCode, setActiveCode] = useState<string>("");
  const [err, setErr] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [alt, setAlt] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);
  const replaceRef = useRef<HTMLInputElement | null>(null);
  const [replaceId, setReplaceId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    const res = await fetch("/api/admin/room-photos", { credentials: "include" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (data.error === "NO_TENANT") {
        window.location.href = "/admin/pick-tenant";
        return;
      }
      setErr(data.error || "객실 사진을 불러오지 못했습니다.");
      return;
    }
    setRoomTypes(data.roomTypes ?? []);
    setPhotos(data.photos ?? {});
    if (data.tenant) setTenantLabel(`${data.tenant.nameKo} · /${data.tenant.slug}`);
    setActiveCode((prev) => prev || data.roomTypes?.[0]?.code || "");
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function flash() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function uploadFile(file: File, category: string) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("category", category);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd, credentials: "include" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(data.error || "업로드에 실패했습니다.");
      return null;
    }
    return data.url as string;
  }

  async function addPhoto(url: string) {
    if (!activeCode) return;
    const res = await fetch("/api/admin/room-photos", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: activeCode, url, alt: alt || `${activeCode} Room` }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data.error || "사진을 추가하지 못했습니다.");
      return false;
    }
    return true;
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !activeCode) return;
    setBusy(true);
    setErr(null);
    const url = await uploadFile(file, `room-${activeCode.toLowerCase()}`);
    if (url && (await addPhoto(url))) {
      setAlt("");
      flash();
      await load();
    }
    if (fileRef.current) fileRef.current.value = "";
    setBusy(false);
  }

  async function onAddUrl() {
    if (!urlInput.trim()) return;
    setBusy(true);
    setErr(null);
    if (await addPhoto(urlInput.trim())) {
      setUrlInput("");
      flash();
      await load();
    }
    setBusy(false);
  }

  async function updatePhoto(id: string, patch: { alt?: string; sortOrder?: number; url?: string }) {
    setBusy(true);
    setErr(null);
    const res = await fetch("/api/admin/room-photos", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    setBusy(false);
    if (!res.ok) {
      setErr("수정에 실패했습니다.");
      return;
    }
    flash();
    await load();
  }

  async function onReplace(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !replaceId || !activeCode) return;
    setBusy(true);
    setErr(null);
    const url = await uploadFile(file, `room-${activeCode.toLowerCase()}`);
    if (url) await updatePhoto(replaceId, { url });
    setReplaceId(null);
    if (replaceRef.current) replaceRef.current.value = "";
    setBusy(false);
  }

  async function removePhoto(id: string) {
    if (!confirm("이 객실 사진을 삭제할까요?")) return;
    setBusy(true);
    setErr(null);
    const res = await fetch("/api/admin/room-photos", {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setBusy(false);
    if (!res.ok) {
      setErr("삭제에 실패했습니다.");
      return;
    }
    flash();
    await load();
  }

  const activePhotos = photos[activeCode] ?? [];
  const activeRoom = roomTypes.find((r) => r.code === activeCode);

  return (
    <div className="space-y-6">
      {tenantLabel ? <p className="text-sm text-muted">{tenantLabel}</p> : null}
      {saved ? <p className="rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-800">저장되었습니다.</p> : null}
      {err ? <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{err}</p> : null}

      <div className="flex flex-wrap gap-2">
        {roomTypes.map((room) => (
          <button
            key={room.id}
            type="button"
            onClick={() => setActiveCode(room.code)}
            className={`rounded-lg px-4 py-2 text-sm ${
              activeCode === room.code ? "bg-[#1b1d1f] text-white" : "border text-muted hover:bg-beige"
            }`}
          >
            {room.nameKo}
            <span className="ml-2 text-xs opacity-70">{(photos[room.code] ?? []).length}장</span>
          </button>
        ))}
      </div>

      {!activeRoom ? (
        <p className="text-sm text-muted">등록된 객실 유형이 없습니다. 요금 관리에서 객실 유형을 먼저 확인하세요.</p>
      ) : (
        <section className="rounded-2xl bg-card p-6 shadow-luxury">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold">{activeRoom.nameKo} 사진</h2>
              <p className="mt-1 text-xs text-muted">
                공개 객실 페이지 슬라이드에 표시됩니다. PNG / JPG / WebP, 최대 8MB. 순서가 작을수록 먼저 보입니다.
                사진을 하나도 올리지 않으면 기본 이미지가 사용됩니다.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activePhotos.length === 0 ? (
              <p className="col-span-full rounded-lg bg-stone-50 p-6 text-center text-sm text-muted">
                아직 올린 사진이 없습니다. 기본 객실 이미지가 공개 페이지에 표시됩니다.
              </p>
            ) : null}
            {activePhotos.map((asset, index) => (
              <div key={asset.id} className="flex flex-col overflow-hidden rounded-xl border bg-background">
                <div className="relative aspect-[5/4] w-full bg-stone-100">
                  <Image src={asset.url} alt={asset.alt ?? ""} fill className="object-cover" sizes="400px" unoptimized />
                  <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-[11px] text-white">
                    {String(index + 1).padStart(2, "0")} / {String(activePhotos.length).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex flex-col gap-2 p-3">
                  <label className="text-[11px] uppercase tracking-wide text-muted">설명</label>
                  <input
                    defaultValue={asset.alt ?? ""}
                    onBlur={(e) => {
                      if (e.target.value !== (asset.alt ?? "")) void updatePhoto(asset.id, { alt: e.target.value });
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
                        if (!Number.isNaN(v) && v !== asset.sortOrder) void updatePhoto(asset.id, { sortOrder: v });
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
                      disabled={busy}
                      onClick={() => void removePhoto(asset.id)}
                      className="rounded-full border border-red-300 px-3 py-1 text-xs text-red-700 hover:bg-red-50"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-3 rounded-xl border border-dashed bg-stone-50/50 p-4">
            <p className="text-sm font-medium">사진 추가</p>
            <input
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="사진 설명 (선택)"
              className="rounded-lg border bg-background px-3 py-2 text-sm"
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              disabled={busy}
              onChange={onFile}
              className="text-sm"
            />
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="또는 이미지 주소 붙여넣기 (예: /images/hotel/rooms/room-01.png)"
                className="rounded-lg border bg-background px-3 py-2 text-sm"
              />
              <button
                type="button"
                disabled={busy || !urlInput.trim()}
                onClick={() => void onAddUrl()}
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
            onChange={onReplace}
          />
        </section>
      )}
    </div>
  );
}
