import { BookPageContent } from "@/components/public/book-page-content";
import { PAGE_SEO, buildMetadata } from "@/lib/seo";
import { getTenantBySlug } from "@/lib/tenant";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = { params: Promise<{ tenantSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenantSlug } = await params;
  return buildMetadata({
    title: PAGE_SEO.book.title,
    description: PAGE_SEO.book.description,
    path: `/${tenantSlug}/book`,
  });
}

export default async function BookPage({ params }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) notFound();

  return <BookPageContent tenantSlug={tenant.slug} tenantName={tenant.nameKo} />;
}
