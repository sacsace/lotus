import { RoomsPageContent } from "@/components/public/rooms-page-content";
import { prisma } from "@/lib/prisma";
import { PAGE_SEO, buildMetadata } from "@/lib/seo";
import { getTenantBySlug } from "@/lib/tenant";
import { PUBLIC_ROOM_CODES, sortRoomTypes } from "@/lib/lotus-rooms";
import { getRoomGalleryUrls } from "@/lib/room-photos";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ tenantSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenantSlug } = await params;
  return buildMetadata({
    title: PAGE_SEO.rooms.title,
    description: PAGE_SEO.rooms.description,
    path: `/${tenantSlug}/rooms`,
  });
}

export default async function RoomsPage({ params }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) notFound();

  const roomTypes = await prisma.roomType.findMany({
    where: { tenantId: tenant.id, code: { in: [...PUBLIC_ROOM_CODES] } },
  });
  const sorted = sortRoomTypes(roomTypes);
  const withGalleries = await Promise.all(
    sorted.map(async (room) => ({
      ...room,
      gallery: await getRoomGalleryUrls(tenant.id, room.code, room.imageUrl),
    })),
  );

  return <RoomsPageContent tenantSlug={tenant.slug} roomTypes={withGalleries} />;
}
