import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppFloat } from "@/components/public/whatsapp-float";
import { getTenantBySlug } from "@/lib/tenant";

type Props = { children: React.ReactNode; params: Promise<{ tenantSlug: string }> };

export default async function TenantLayout({ children, params }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader tenantSlug={tenant.slug} brandName="Lotus Korean Hotel" branchName={tenant.nameKo} />
      <div className="flex-1 pt-16">{children}</div>
      <SiteFooter
        tenantSlug={tenant.slug}
        brandName="Lotus Korean Hotel"
        phone={tenant.phone}
        email={tenant.email}
        address={tenant.address}
      />
      {tenant.whatsapp && <WhatsAppFloat phone={tenant.whatsapp} />}
    </div>
  );
}
