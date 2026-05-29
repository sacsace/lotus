import { RoomsPageContent } from "@/components/public/rooms-page-content";
import { prisma } from "@/lib/prisma";
import { getTenantBySlug } from "@/lib/tenant";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ tenantSlug: string }> };

export default async function RoomsPage({ params }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) notFound();

  const roomTypes = await prisma.roomType.findMany({
    where: { tenantId: tenant.id },
    orderBy: { baseRate: "asc" },
  });

  return <RoomsPageContent tenantSlug={tenant.slug} roomTypes={roomTypes} />;
}
