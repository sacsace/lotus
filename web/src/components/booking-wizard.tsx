"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatMsg, useI18n } from "@/components/language-provider";

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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [err, setErr] = useState<string | null>(null);
  const [created, setCreated] = useState<{ id: string; publicCode: string } | null>(null);

  async function loadAvail() {
    setErr(null);
    setLoadingAvail(true);
    try {
      const res = await fetch(
        `${api("/availability")}?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}`,
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
    void loadAvail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantSlug]);

  const selected = rooms.find((r) => r.id === selectedId);

  async function createReservation() {
    setErr(null);
    if (!selectedId) {
      setErr(t.booking.selectRoom);
      return;
    }
    const res = await fetch(api("/reservations"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guestName,
        guestEmail,
        guestPhone,
        checkIn,
        checkOut,
        guests,
        roomTypeId: selectedId,
      }),
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j.error || t.booking.reserveFail);
    setCreated({ id: j.id, publicCode: j.publicCode });
    setStep(3);
  }

  async function payMock() {
    if (!created) return;
    setErr(null);
    const res = await fetch(api(`/reservations/${created.id}/pay-mock`), { method: "POST" });
    const j = await res.json();
    if (!res.ok) setErr(j.error || t.booking.payFail);
    else setCreated((c) => (c ? { ...c, publicCode: j.publicCode || c.publicCode } : c));
  }

  const myRes = `/${tenantSlug}/my-reservation`;

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <ol className="flex gap-2 text-sm text-stone-500">
        <li className={step >= 1 ? "font-medium text-stone-900" : ""}>{t.booking.step1}</li>
        <li aria-hidden="true" className="text-muted">→</li>
        <li className={step >= 2 ? "font-medium text-stone-900" : ""}>{t.booking.step2}</li>
        <li aria-hidden="true" className="text-muted">→</li>
        <li className={step >= 3 ? "font-medium text-stone-900" : ""}>{t.booking.step3}</li>
      </ol>

      {step === 1 && (
        <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
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
          {rooms[0]?.mvsNote && (
            <p className="text-xs text-amber-800 bg-amber-50 rounded-md px-3 py-2">{rooms[0].mvsNote}</p>
          )}
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
                    <p className="text-xs text-stone-500">
                      {formatMsg(t.booking.nightsRemaining, { nights: r.nights, count: r.availableLocal })}
                    </p>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <p className="font-semibold text-stone-900">{r.estimatedTotal.toLocaleString()}원</p>
                  <p className="text-xs text-stone-500">{formatMsg(t.booking.perNightPrice, { price: r.baseRate.toLocaleString() })}</p>
                </div>
              </label>
            ))}
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700">{t.booking.guests}</label>
            <input
              type="number"
              min={1}
              max={6}
              className="mt-1 w-24 rounded-md border border-stone-300 px-3 py-2"
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
            />
          </div>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button
            type="button"
            onClick={() => {
              setErr(null);
              if (!selected || selected.availableLocal < 1) {
                setErr(t.booking.noRoom);
                return;
              }
              setStep(2);
            }}
            className="w-full rounded-md bg-stone-900 py-2.5 text-sm font-medium text-white hover:bg-stone-800"
          >
            {t.common.next}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
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
          {err && <p className="text-sm text-red-600">{err}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 rounded-md border border-stone-300 py-2.5 text-sm"
            >
              {t.common.prev}
            </button>
            <button
              type="button"
              onClick={() => {
                void createReservation().catch((e) => setErr(e instanceof Error ? e.message : t.common.error));
              }}
              className="flex-1 rounded-md bg-stone-900 py-2.5 text-sm font-medium text-white"
            >
              {t.booking.create}
            </button>
          </div>
        </div>
      )}

      {step === 3 && created && (
        <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-lg font-semibold text-stone-900">{formatMsg(t.booking.reservationCode, { code: created.publicCode })}</p>
          <p className="text-sm text-stone-600">{t.booking.payNote}</p>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button
            type="button"
            onClick={() => void payMock().catch((e) => setErr(e instanceof Error ? e.message : t.common.error))}
            className="w-full rounded-md bg-emerald-800 py-2.5 text-sm font-medium text-white hover:bg-emerald-900"
          >
            {t.booking.payMock}
          </button>
          <p className="text-center text-sm">
            <Link href={myRes} className="text-stone-900 underline">
              {t.booking.lookup}
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
