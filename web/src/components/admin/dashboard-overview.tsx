"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

type Stats = {
  checkInsToday: number;
  checkOutsToday: number;
  currentGuests: number;
  occupiedRooms: number;
  availableRooms: number;
  pendingPickups: number;
  pendingCForms: number;
  mealGuests: number;
  newInquiries: number;
};

const CARDS: { key: keyof Stats; label: string; href?: string; color: string }[] = [
  { key: "checkInsToday", label: "Today's Check-ins", href: "/admin/guests", color: "from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/10" },
  { key: "checkOutsToday", label: "Today's Check-outs", href: "/admin/guests", color: "from-stone-50 to-stone-100 dark:from-stone-800/30 dark:to-stone-900/20" },
  { key: "currentGuests", label: "Current Guests", href: "/admin/guests", color: "from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/10" },
  { key: "occupiedRooms", label: "Occupied Rooms", href: "/admin/rooms", color: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10" },
  { key: "availableRooms", label: "Available Rooms", href: "/admin/rooms", color: "from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-800/10" },
  { key: "pendingPickups", label: "Pending Pickups", href: "/admin/pickups", color: "from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/10" },
  { key: "pendingCForms", label: "Pending C-Forms", href: "/admin/guests", color: "from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/10" },
  { key: "mealGuests", label: "Meal Requests", color: "from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/10" },
];

export function DashboardOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/dashboard");
      if (!res.ok) {
        setFetchError(`Failed to load dashboard (${res.status})`);
        return;
      }
      const data = await res.json();
      setStats(data.stats);
      setLastSync(data.tenant?.lastMvsSyncAt ?? null);
      setFetchError(null);
    } catch (err) {
      console.warn("Dashboard fetch failed", err);
      setFetchError("Connection lost. Retrying…");
    }
  }, []);

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load(), 60_000);
    return () => clearInterval(interval);
  }, [load]);

  async function syncMvs() {
    setSyncing(true);
    try {
      await fetch("/api/admin/mvs/sync", { method: "POST" });
      await load();
    } catch (err) {
      console.warn("Sync failed", err);
      setFetchError("Sync failed. Please try again.");
    } finally {
      setSyncing(false);
    }
  }

  if (!stats) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-beige dark:bg-charcoal/50" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {fetchError && (
        <p className="mb-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
          {fetchError}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted">
          Auto-refresh every 60s
          {lastSync && ` · Last MVS sync: ${new Date(lastSync).toLocaleString()}`}
        </p>
        <button
          type="button"
          onClick={() => void syncMvs()}
          disabled={syncing}
          className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {syncing ? "Syncing…" : "Sync from MVS"}
        </button>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((card, i) => {
          const value = stats[card.key];
          const inner = (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-2xl bg-gradient-to-br ${card.color} p-6 shadow-luxury`}
            >
              <p className="text-sm text-muted">{card.label}</p>
              <p className="mt-2 text-3xl font-semibold">{value}</p>
            </motion.div>
          );
          return card.href ? (
            <Link key={card.key} href={card.href}>{inner}</Link>
          ) : (
            <div key={card.key}>{inner}</div>
          );
        })}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-2xl bg-gradient-to-br from-stone-50 to-stone-100 p-6 shadow-luxury dark:from-stone-800/30 dark:to-stone-900/20">
          <p className="text-sm text-muted">New Inquiries</p>
          <p className="mt-2 text-3xl font-semibold text-amber-800 dark:text-amber-300">{stats.newInquiries}</p>
          <Link href="/admin/inquiries" className="mt-2 inline-block text-xs text-gold hover:underline">View →</Link>
        </motion.div>
      </div>
    </div>
  );
}
