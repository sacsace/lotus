import { DiningPageContent } from "@/components/public/dining-page-content";
import { getDiningGalleryUrls } from "@/lib/dining-photos";
import { HANSIK_MENU_KEY, readHansikMenu } from "@/lib/hansik-menu";
import { prisma } from "@/lib/prisma";
import { PAGE_SEO, buildMetadata } from "@/lib/seo";
import { getTenantBySlug } from "@/lib/tenant";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = { params: Promise<{ tenantSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenantSlug } = await params;
  return buildMetadata({
    title: PAGE_SEO.dining.title,
    description: PAGE_SEO.dining.description,
    path: `/${tenantSlug}/dining`,
  });
}

export default async function DiningPage({ params }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) notFound();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [menus, hansik, gallery] = await Promise.all([
    prisma.diningMenu.findMany({
      where: { tenantId: tenant.id, menuDate: today },
    }),
    prisma.siteContent.findUnique({
      where: { tenantId_key: { tenantId: tenant.id, key: HANSIK_MENU_KEY } },
    }),
    getDiningGalleryUrls(tenant.id),
  ]);

  const breakfast = menus.find((m) => m.mealType === "breakfast");
  const dinner = menus.find((m) => m.mealType === "dinner");

  const parseItems = (raw?: string, fallback?: readonly string[]) => {
    if (!raw) return [...(fallback ?? [])];
    try {
      return JSON.parse(raw) as string[];
    } catch {
      return [...(fallback ?? [])];
    }
  };

  return (
    <DiningPageContent
      breakfast={parseItems(breakfast?.items)}
      dinner={parseItems(dinner?.items)}
      menu={readHansikMenu(hansik?.value)}
      gallery={gallery}
    />
  );
}
