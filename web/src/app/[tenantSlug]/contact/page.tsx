import { ContactPageContent } from "@/components/public/contact-page-content";
import { getTenantBySlug } from "@/lib/tenant";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ tenantSlug: string }> };

export default async function ContactPage({ params }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) notFound();

  return (
    <ContactPageContent
      tenantSlug={tenant.slug}
      phone={tenant.phone}
      email={tenant.email}
      whatsapp={tenant.whatsapp}
      address={tenant.address}
      mapEmbedUrl={tenant.mapEmbedUrl}
    />
  );
}
