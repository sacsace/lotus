import { HomePage } from "@/components/public/home-page";
import { getHeroImages } from "@/lib/content";
import { prisma } from "@/lib/prisma";
import { getTenantBySlug } from "@/lib/tenant";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ tenantSlug: string }> };

export default async function TenantHomePage({ params }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) notFound();

  const [heroImages, rooms] = await Promise.all([
    getHeroImages(tenant.id),
    prisma.roomType.findMany({
      where: { tenantId: tenant.id },
      orderBy: { baseRate: "asc" },
      take: 3,
    }),
  ]);

  return (
    <HomePage
      tenantSlug={tenant.slug}
      heroImages={heroImages}
      rooms={rooms}
      address={tenant.address}
    />
  );
}
