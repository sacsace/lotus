"use client";

import { useCallback, useEffect, useState } from "react";

type Pickup = {
  id: string;
  guestName: string;
  flightNumber: string | null;
  arrivalTime: string | null;
  driverName: string | null;
  status: string;
  notes: string | null;
};

export function PickupManager() {
  const [pickups, setPickups] = useState<Pickup[]>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/pickups");
    if (res.ok) {
      const data = await res.json();
      setPickups(data.pickups);
    }
  }, []);

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load(), 30_000);
    return () => clearInterval(interval);
  }, [load]);

  async function updateStatus(id: string, status: string) {
    await fetch("/api/admin/pickups", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    void load();
  }

  return (
    <div className="space-y-4">
      {pickups.length === 0 ? (
        <p className="rounded-2xl bg-card p-8 text-center text-muted shadow-luxury">No pickup requests</p>
      ) : (
        pickups.map((p) => (
          <article key={p.id} className="rounded-2xl bg-card p-6 shadow-luxury">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold">{p.guestName}</h3>
                <p className="mt-1 text-sm text-muted">Flight {p.flightNumber ?? "—"} · {p.arrivalTime ? new Date(p.arrivalTime).toLocaleString() : "TBD"}</p>
                {p.driverName && <p className="mt-1 text-sm">Driver: {p.driverName}</p>}
                {p.notes && <p className="mt-2 text-xs text-muted">{p.notes}</p>}
              </div>
              <select
                value={p.status}
                onChange={(e) => void updateStatus(p.id, e.target.value)}
                className="rounded-lg border bg-beige px-3 py-2 text-sm"
              >
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </article>
        ))
      )}
    </div>
  );
}
