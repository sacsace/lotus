"use client";

import Link from "next/link";
import { useI18n } from "@/components/language-provider";

export function RootHomeMessage() {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-2xl font-semibold">{t.root.noTenant}</h1>
      <p className="mt-3 text-muted">{t.root.noTenantDesc}</p>
      <p className="mt-10 text-sm text-muted">
        <Link href="/admin/login" className="text-gold underline">
          /admin/login
        </Link>
      </p>
    </div>
  );
}
