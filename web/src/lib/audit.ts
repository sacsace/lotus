import { prisma } from "@/lib/prisma";

export async function logAdminAction(params: {
  adminUserId?: string | null;
  tenantId?: string | null;
  action: string;
  resource: string;
  details?: string;
  ipAddress?: string | null;
}) {
  await prisma.auditLog.create({
    data: {
      adminUserId: params.adminUserId ?? undefined,
      tenantId: params.tenantId ?? undefined,
      action: params.action,
      resource: params.resource,
      details: params.details,
      ipAddress: params.ipAddress ?? undefined,
    },
  });
}
