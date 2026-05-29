import { redirect } from "next/navigation";
import { RootHomeMessage } from "@/components/public/root-home";
import { listTenantsPublic } from "@/lib/tenant";

export default async function RootHomePage() {
  const tenants = await listTenantsPublic();
  const preferred = process.env.DEFAULT_TENANT_SLUG?.trim();
  const target =
    (preferred && tenants.find((t) => t.slug === preferred)?.slug) ??
    tenants.find((t) => t.slug === "lotus-india")?.slug ??
    tenants.find((t) => t.slug === "lotus-gangnam")?.slug ??
    tenants[0]?.slug;

  if (target) {
    redirect(`/${target}`);
  }

  return <RootHomeMessage />;
}
