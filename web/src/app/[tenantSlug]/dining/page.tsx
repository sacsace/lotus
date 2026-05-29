import { DiningPageContent } from "@/components/public/dining-page-content";
import { prisma } from "@/lib/prisma";
import { getTenantBySlug } from "@/lib/tenant";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ tenantSlug: string }> };

export default async function DiningPage({ params }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) notFound();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const menus = await prisma.diningMenu.findMany({
    where: { tenantId: tenant.id, menuDate: today },
  });

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
    />
  );
}
