import { HomePage } from "@/components/public/home-page";
import { getHeroImages } from "@/lib/content";
import { getDiningGalleryUrls } from "@/lib/dining-photos";
import { prisma } from "@/lib/prisma";
import { PAGE_SEO, buildMetadata } from "@/lib/seo";
import { getTenantBySlug } from "@/lib/tenant";
import { PUBLIC_ROOM_CODES, sortRoomTypes } from "@/lib/lotus-rooms";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ tenantSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenantSlug } = await params;
  return buildMetadata({
    title: PAGE_SEO.home.title,
    description: PAGE_SEO.home.description,
    path: `/${tenantSlug}`,
    absoluteTitle: true,
  });
}

export default async function TenantHomePage({ params }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) notFound();

  const [heroImages, rooms, diningGallery] = await Promise.all([
    getHeroImages(tenant.id),
    prisma.roomType.findMany({
      where: { tenantId: tenant.id, code: { in: [...PUBLIC_ROOM_CODES] } },
    }),
    getDiningGalleryUrls(tenant.id),
  ]);

  return (
    <HomePage
      tenantSlug={tenant.slug}
      heroImages={heroImages}
      rooms={sortRoomTypes(rooms)}
      diningGallery={diningGallery}
      address={tenant.address}
      phone={tenant.phone}
      email={tenant.email}
    />
  );
}
