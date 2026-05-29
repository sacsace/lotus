import { BookPageContent } from "@/components/public/book-page-content";
import { getTenantBySlug } from "@/lib/tenant";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ tenantSlug: string }> };

export default async function BookPage({ params }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) notFound();

  return <BookPageContent tenantSlug={tenant.slug} tenantName={tenant.nameKo} />;
}
