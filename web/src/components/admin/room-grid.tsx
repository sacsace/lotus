"use client";

import { useCallback, useEffect, useState } from "react";

type Room = {
  id: string;
  roomNumber: string;
  occupancyStatus: string;
  cleaningStatus: string;
  maintenanceStatus: string;
  housekeepingNotes: string | null;
  roomType: { nameKo: string; code: string } | null;
  guest: { guestName: string } | null;
};

const OCC_COLORS: Record<string, string> = {
  available: "border-emerald-400/60 bg-emerald-50 dark:bg-emerald-900/20",
  occupied: "border-rose-400/60 bg-rose-50 dark:bg-rose-900/20",
  reserved: "border-amber-400/60 bg-amber-50 dark:bg-amber-900/20",
  out_of_order: "border-stone-400/60 bg-stone-100 dark:bg-stone-800/30",
};

export function RoomGrid() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/rooms");
    if (res.ok) {
      const data = await res.json();
      setRooms(data.rooms);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load(), 30_000);
    return () => clearInterval(interval);
  }, [load]);

  async function updateRoom(id: string, field: string, value: string) {
    await fetch("/api/admin/rooms", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, [field]: value }),
    });
    void load();
  }

  if (loading) {
    return <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 7 }).map((_, i) => <div key={i} className="h-40 animate-pulse rounded-2xl bg-beige" />)}</div>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {rooms.map((room) => (
        <article
          key={room.id}
          className={`rounded-2xl border-2 p-4 shadow-luxury transition hover:-translate-y-0.5 ${OCC_COLORS[room.occupancyStatus] ?? OCC_COLORS.available}`}
        >
          <div className="flex items-start justify-between">
            <p className="text-2xl font-semibold">{room.roomNumber}</p>
            <span className="text-xs uppercase text-muted">{room.roomType?.code}</span>
          </div>
          <p className="mt-1 text-sm text-muted">{room.roomType?.nameKo}</p>
          {room.guest && <p className="mt-2 text-sm font-medium">{room.guest.guestName}</p>}
          <div className="mt-4 space-y-2">
            <label className="block text-xs text-muted">
              Occupancy
              <select
                value={room.occupancyStatus}
                onChange={(e) => void updateRoom(room.id, "occupancyStatus", e.target.value)}
                className="mt-1 w-full rounded border bg-card px-2 py-1 text-xs"
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
                <option value="out_of_order">Out of order</option>
              </select>
            </label>
            <label className="block text-xs text-muted">
              Cleaning
              <select
                value={room.cleaningStatus}
                onChange={(e) => void updateRoom(room.id, "cleaningStatus", e.target.value)}
                className="mt-1 w-full rounded border bg-card px-2 py-1 text-xs"
              >
                <option value="clean">Clean</option>
                <option value="dirty">Dirty</option>
                <option value="in_progress">In progress</option>
              </select>
            </label>
          </div>
        </article>
      ))}
    </div>
  );
}
