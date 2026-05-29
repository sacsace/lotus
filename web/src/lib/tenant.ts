import { prisma } from "@/lib/prisma";

export async function getTenantBySlug(slug: string) {
  return prisma.tenant.findUnique({ where: { slug } });
}

export async function listTenantsPublic() {
  return prisma.tenant.findMany({
    orderBy: { nameKo: "asc" },
    select: { slug: true, nameKo: true, mvsCompanyId: true },
  });
}
