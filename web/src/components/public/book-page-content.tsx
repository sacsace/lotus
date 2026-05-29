"use client";

import { TenantBookingWidget } from "@/components/tenant-widgets";
import { formatMsg, useI18n } from "@/components/language-provider";

type Props = {
  tenantSlug: string;
  tenantName: string;
};

export function BookPageContent({ tenantSlug, tenantName }: Props) {
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-stone-900">
        {formatMsg(t.pages.book.title, { name: tenantName })}
      </h1>
      <p className="mt-2 text-stone-600">{t.pages.book.subtitle}</p>
      <div className="mt-8">
        <TenantBookingWidget tenantSlug={tenantSlug} />
      </div>
    </div>
  );
}
