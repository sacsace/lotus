"use client";

import Link from "next/link";
import { SiteLogo } from "@/components/site-logo";
import { useI18n } from "@/components/language-provider";

type Props = {
  tenantSlug: string;
  brandName: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
};

export function SiteFooter({ tenantSlug, brandName, phone, email, address }: Props) {
  const p = `/${tenantSlug}`;
  const year = new Date().getFullYear();
  const { t } = useI18n();

  return (
    <footer className="border-t border-border bg-beige">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
        <div>
          <SiteLogo variant="footer" />
          <p className="mt-4 text-sm leading-relaxed text-muted">{t.footer.brandDesc}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{t.footer.explore}</p>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li><Link href={`${p}/rooms`} className="transition hover:text-gold">{t.nav.rooms}</Link></li>
            <li><Link href={`${p}/dining`} className="transition hover:text-gold">{t.nav.dining}</Link></li>
            <li><Link href={`${p}/services`} className="transition hover:text-gold">{t.nav.services}</Link></li>
            <li><Link href={`${p}/book`} className="transition hover:text-gold">{t.nav.book}</Link></li>
          </ul>
        </div>
        <FooterContact phone={phone} email={email} address={address} t={t} />
        <div>
          <p className="text-sm font-medium text-foreground">{t.footer.operations}</p>
          <p className="mt-4 text-sm text-muted">{t.footer.operationsDesc}</p>
          <Link href="/admin/login" className="mt-4 inline-block text-sm text-gold transition hover:underline">
            {t.footer.staffLogin}
          </Link>
        </div>
      </div>
      <div className="border-t border-border px-4 py-6 text-center text-xs text-muted">
        © {year} {brandName}. {t.footer.copyright}
      </div>
    </footer>
  );
}

function FooterContact({
  phone,
  email,
  address,
  t,
}: {
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <div>
      <p className="text-sm font-medium text-foreground">{t.footer.contact}</p>
      <ul className="mt-4 space-y-2 text-sm text-muted">
        {phone && <li>{phone}</li>}
        {email && <li>{email}</li>}
        {address && <li className="max-w-xs leading-relaxed">{address}</li>}
      </ul>
    </div>
  );
}
