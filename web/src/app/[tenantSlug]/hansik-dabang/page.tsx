import { redirect } from "next/navigation";

type Props = { params: Promise<{ tenantSlug: string }> };

export default async function HansikRedirectPage({ params }: Props) {
  const { tenantSlug } = await params;
  redirect(`/${tenantSlug}/dining`);
}
