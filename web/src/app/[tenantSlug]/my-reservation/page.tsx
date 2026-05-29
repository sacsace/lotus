import { MyReservationPageContent } from "@/components/public/my-reservation-page-content";
import { getTenantBySlug } from "@/lib/tenant";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ tenantSlug: string }> };

export default async function MyReservationPage({ params }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) notFound();

  return <MyReservationPageContent tenantSlug={tenant.slug} tenantName={tenant.nameKo} />;
}
