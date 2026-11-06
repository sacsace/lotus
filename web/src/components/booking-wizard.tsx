"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/language-provider";

type RoomRow = {
  id: string;
  code: string;
  nameKo: string;
  baseRate: number;
  nights: number;
  estimatedTotal: number;
  availableLocal: number;
  mvsNote?: string;
  mvsSource?: string;
};

type Props = { tenantSlug: string };

export function BookingWizard({ tenantSlug }: Props) {
  const { t } = useI18n();
  const api = (path: string) => `/api/tenants/${encodeURIComponent(tenantSlug)}${path}`;
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [rooms, setRooms] = useState<RoomRow[]>([]);
  const [loadingAvail, setLoadingAvail] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guests, setGuests] = useState(2);
  const [roomCount, setRoomCount] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [student, setStudent] = useState<"none" | "highschool" | "university">("none");
  const [pickup, setPickup] = useState(false);
  const [flightNumber, setFlightNumber] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [vehicles, setVehicles] = useState(1);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [sentOpen, setSentOpen] = useState(false);

  async function loadAvail(inn = checkIn, out = checkOut) {
    setErr(null);
    setLoadingAvail(true);
    try {
      const res = await fetch(
        `${api("/availability")}?checkIn=${encodeURIComponent(inn)}&checkOut=${encodeURIComponent(out)}`,
      );
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || t.booking.availFail);
      setRooms(j.rooms || []);
      if (j.rooms?.length && !selectedId) setSelectedId(j.rooms[0].id);
    } catch (e) {
      setErr(e instanceof Error ? e.message : t.common.error);
    } finally {
      setLoadingAvail(false);
    }
  }

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const inn = q.get("checkIn");
    const out = q.get("checkOut");
    const g = Number(q.get("guests"));
    const rc = Number(q.get("rooms"));
    const nextIn = inn && /^\d{4}-\d{2}-\d{2}$/.test(inn) ? inn : today;
    const nextOut = out && /^\d{4}-\d{2}-\d{2}$/.test(out) ? out : tomorrow;
    setCheckIn(nextIn);
    setCheckOut(nextOut);
    if (g >= 1 && g <= 6) setGuests(g);
    if (rc >= 1 && rc <= 8) setRoomCount(rc);
    void loadAvail(nextIn, nextOut);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantSlug]);

  useEffect(() => {
    if (!sentOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSentOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sentOpen]);

  const selected = rooms.find((r) => r.id === selectedId);

  async function sendRequest() {
    setErr(null);
    if (!selected) {
      setErr(t.booking.selectRoom);
      return;
    }
    if (!guestName.trim() || !guestEmail.trim()) {
      setErr("이름과 메일을 적어 주세요.");
      return;
    }
    if (pickup && (!flightNumber.trim() || !arrivalTime)) {
      setErr("공항 픽업은 도착 시간과 항공편을 적어 주세요.");
      return;
    }
    if (pickup && vehicles < 1) {
      setErr("필요한 차량 수를 적어 주세요.");
      return;
    }
    const studentLabel = student === "highschool" ? "고등학생" : student === "university" ? "대학생" : "해당 없음";
    const message = [
      `성명: ${guestName.trim()}`,
      `객실: ${selected.nameKo}`,
      `객실 수: ${roomCount}`,
      `도착: ${checkIn}`,
      `출발: ${checkOut}`,
      `인원: ${guests}`,
      `학생 할인: ${studentLabel}`,
      `전화: ${guestPhone.trim() || "-"}`,
      pickup
        ? `공항 픽업: 요청\n도착 시간: ${arrivalTime.replace("T", " ")}\n항공편: ${flightNumber.trim()}\n차량: ${vehicles}대\n요금: 차량 한 대당 USD 27 (USD ${vehicles * 27})`
        : "공항 픽업: 없음",
      note.trim() ? `메모: ${note.trim()}` : "",
      "",
      "이 메일은 예약 완료가 아닌 요청입니다. 답장으로 안내해 주세요.",
    ]
      .filter(Boolean)
      .join("\n");

    setSending(true);
    try {
      const res = await fetch(api("/inquiries"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: pickup ? "숙박 예약 요청 · 공항 픽업" : "숙박 예약 요청",
          body: message,
          contact: guestEmail.trim(),
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || t.booking.reserveFail);
      setSentOpen(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <p className="text-sm leading-6 text-[#5e676c]">고등학생·대학생 특별 할인이 있습니다. 해당하면 예약 요청에 선택해 주세요.</p>

      <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-stone-700">{t.booking.checkIn}</label>
              <input
                type="date"
                className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700">{t.booking.checkOut}</label>
              <input
                type="date"
                className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => void loadAvail()}
            disabled={loadingAvail}
            className="rounded-md border border-stone-300 px-4 py-2 text-sm hover:bg-stone-50"
          >
            {loadingAvail ? t.common.loading : t.booking.reloadAvail}
          </button>
          <div className="space-y-2">
            {rooms.map((r) => (
              <label
                key={r.id}
                className={`flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 ${
                  selectedId === r.id ? "border-stone-900 bg-stone-50" : "border-stone-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="room"
                    checked={selectedId === r.id}
                    onChange={() => setSelectedId(r.id)}
                  />
                  <div>
                    <p className="font-medium text-stone-900">{r.nameKo}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-20 gap-y-6 pb-4 sm:gap-x-36">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-stone-700">객실 수</label>
              <input
                type="number"
                min={1}
                max={8}
                className="w-24 rounded-md border border-stone-300 px-3 py-2"
                value={roomCount}
                onChange={(e) => setRoomCount(Number(e.target.value))}
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-stone-700">{t.booking.guests}</label>
              <input
                type="number"
                min={1}
                max={6}
                className="w-24 rounded-md border border-stone-300 px-3 py-2"
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
              />
            </div>
          </div>
          <p className="text-sm text-stone-600">{t.booking.guestNote}</p>
          <div>
            <label className="text-sm font-medium text-stone-700">{t.booking.name}</label>
            <input
              className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700">{t.booking.email}</label>
            <input
              type="email"
              className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700">{t.booking.phone}</label>
            <input
              className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
            />
          </div>
          <fieldset>
            <legend className="text-sm font-medium text-stone-700">공항 픽업</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                aria-pressed={!pickup}
                onClick={() => setPickup(false)}
                className={`border px-3 py-2 text-sm ${!pickup ? "border-[#1b1d1f] bg-[#1b1d1f] text-white" : "border-stone-300"}`}
              >
                필요 없음
              </button>
              <button
                type="button"
                aria-pressed={pickup}
                onClick={() => setPickup(true)}
                className={`border px-3 py-2 text-sm ${pickup ? "border-[#1b1d1f] bg-[#1b1d1f] text-white" : "border-stone-300"}`}
              >
                픽업 요청
              </button>
            </div>
            <p className="mt-3 text-sm text-[#5e676c]">차량 한 대당 USD 27입니다.</p>
            {pickup ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-sm font-medium text-stone-700">도착 시간</label>
                  <input
                    type="datetime-local"
                    className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700">항공편</label>
                  <input
                    className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                    placeholder="KE 123"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700">차량 수</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2"
                    value={vehicles}
                    onChange={(e) => setVehicles(Number(e.target.value))}
                    required
                  />
                  <p className="mt-1 text-xs text-[#5e676c]">USD {Math.max(1, vehicles) * 27}</p>
                </div>
              </div>
            ) : null}
          </fieldset>
          <fieldset>
            <legend className="text-sm font-medium text-stone-700">학생 할인</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {(
                [
                  ["none", "해당 없음"],
                  ["highschool", "고등학생"],
                  ["university", "대학생"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={student === value}
                  onClick={() => setStudent(value)}
                  className={`border px-3 py-2 text-sm ${student === value ? "border-[#1b1d1f] bg-[#1b1d1f] text-white" : "border-stone-300"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
          <div>
            <label className="text-sm font-medium text-stone-700">메모</label>
            <textarea
              className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2"
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="일정이나 할인 확인에 필요한 내용을 적어 주세요."
            />
          </div>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button
            type="button"
            disabled={sending}
            onClick={() => {
              setErr(null);
              if (!selected || selected.availableLocal < 1) {
                setErr(t.booking.noRoom);
                return;
              }
              void sendRequest().catch((e) => setErr(e instanceof Error ? e.message : t.common.error));
            }}
            className="w-full rounded-md bg-stone-900 py-2.5 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-60"
          >
            {sending ? "보내는 중…" : t.booking.create}
          </button>
        </div>

      {sentOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#1b1d1f]/50 p-4" role="presentation" onClick={() => setSentOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-sent-title"
            className="w-full max-w-md bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="booking-sent-title" className="text-xl font-semibold tracking-[-0.03em]">
              요청을 보냈습니다
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#5e676c]">
              호텔에서 입력하신 메일로 답장을 드립니다. 이 안내는 예약이 완료되었다는 뜻이 아닙니다.
            </p>
            <button type="button" className="mt-6 bg-[#1b1d1f] px-5 py-2.5 text-sm text-white" onClick={() => setSentOpen(false)}>
              확인
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
