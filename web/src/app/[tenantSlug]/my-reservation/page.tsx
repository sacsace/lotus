import { MyReservationPageContent } from "@/components/public/my-reservation-page-content";
import { PAGE_SEO, buildMetadata } from "@/lib/seo";
import { getTenantBySlug } from "@/lib/tenant";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = { params: Promise<{ tenantSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenantSlug } = await params;
  return buildMetadata({
    title: PAGE_SEO.myReservation.title,
    description: PAGE_SEO.myReservation.description,
    path: `/${tenantSlug}/my-reservation`,
    noIndex: true,
  });
}

export default async function MyReservationPage({ params }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) notFound();

  return <MyReservationPageContent tenantSlug={tenant.slug} tenantName={tenant.nameKo} />;
}
