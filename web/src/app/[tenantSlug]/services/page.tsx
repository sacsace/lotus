import { ServicesPageContent } from "@/components/public/services-page-content";
import { getTenantBySlug } from "@/lib/tenant";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ tenantSlug: string }> };

export default async function ServicesPage({ params }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) notFound();

  return <ServicesPageContent tenantSlug={tenant.slug} />;
}
