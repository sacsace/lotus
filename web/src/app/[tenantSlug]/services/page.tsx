import { ServicesPageContent } from "@/components/public/services-page-content";
import { PAGE_SEO, buildMetadata } from "@/lib/seo";
import { getTenantBySlug } from "@/lib/tenant";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = { params: Promise<{ tenantSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenantSlug } = await params;
  return buildMetadata({
    title: PAGE_SEO.services.title,
    description: PAGE_SEO.services.description,
    path: `/${tenantSlug}/services`,
  });
}

export default async function ServicesPage({ params }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) notFound();

  return <ServicesPageContent tenantSlug={tenant.slug} />;
}
