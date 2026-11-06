import { ContactPageContent } from "@/components/public/contact-page-content";
import { PAGE_SEO, buildMetadata } from "@/lib/seo";
import { getTenantBySlug } from "@/lib/tenant";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = { params: Promise<{ tenantSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenantSlug } = await params;
  return buildMetadata({
    title: PAGE_SEO.contact.title,
    description: PAGE_SEO.contact.description,
    path: `/${tenantSlug}/contact`,
  });
}

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
