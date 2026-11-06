"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type TenantBrief = { slug: string; nameKo: string };

export function AdminLoginForm() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr((j as { error?: string }).error || "Login failed");
      return;
    }
    const j = (await res.json()) as { tenants?: TenantBrief[] };
    const tenants = j.tenants ?? [];
    if (tenants.length > 1) {
      router.replace("/admin/pick-tenant");
      return;
    }
    if (tenants.length === 1) {
      await fetch("/api/admin/select-tenant", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: tenants[0]!.slug }),
      });
    }
    router.replace("/admin/dashboard");
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <input
        type="text"
        className="w-full rounded-lg border border-beige bg-card px-4 py-3 text-sm"
        placeholder="ID"
        value={id}
        onChange={(e) => setId(e.target.value)}
        autoComplete="username"
      />
      <input
        type="password"
        className="w-full rounded-lg border border-beige bg-card px-4 py-3 text-sm"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
      />
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button type="submit" className="w-full rounded-full bg-charcoal py-3 text-sm font-medium text-white dark:bg-gold dark:text-charcoal">
        Sign in
      </button>
    </form>
  );
}
