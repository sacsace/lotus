import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { COOKIE_NAME, verifyAdminJwt, type AdminJwtPayload } from "@/lib/admin-auth";
import { hasPermission, isAdminRole, type AdminRole, type Permission } from "@/lib/rbac";

export const ADMIN_TENANT_COOKIE = "lotus_admin_tenant";

export async function getAdminSession(): Promise<AdminJwtPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminJwt(token);
}

export async function assertAdminCookie(): Promise<boolean> {
  return (await getAdminSession()) !== null;
}

export async function requirePermission(permission: Permission): Promise<AdminJwtPayload | null> {
  const session = await getAdminSession();
  if (!session) return null;
  if (!isAdminRole(session.role)) return null;
  if (!hasPermission(session.role, permission)) return null;
  return session;
}

export async function getAdminTenantSlug(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(ADMIN_TENANT_COOKIE)?.value ?? null;
}

export async function getAdminTenant() {
  const slug = await getAdminTenantSlug();
  if (!slug) return null;
  return prisma.tenant.findUnique({ where: { slug } });
}

export function canRoleAccessRoute(role: AdminRole, pathname: string): boolean {
  if (pathname.startsWith("/admin/dashboard")) return hasPermission(role, "dashboard:view");
  if (pathname.startsWith("/admin/guests")) return hasPermission(role, "guests:view");
  if (pathname.startsWith("/admin/rooms")) return hasPermission(role, "rooms:view");
  if (pathname.startsWith("/admin/room-photos")) return hasPermission(role, "content:view");
  if (pathname.startsWith("/admin/dining-photos")) return hasPermission(role, "content:view");
  if (pathname.startsWith("/admin/pickups")) return hasPermission(role, "pickups:view");
  if (pathname.startsWith("/admin/content")) return hasPermission(role, "content:view");
  if (pathname.startsWith("/admin/menu")) return hasPermission(role, "content:view");
  if (pathname.startsWith("/admin/rates")) return hasPermission(role, "rates:view");
  if (pathname.startsWith("/admin/reservations")) return hasPermission(role, "reservations:view");
  if (pathname.startsWith("/admin/inquiries")) return hasPermission(role, "inquiries:view");
  if (pathname.startsWith("/admin/tenant-settings")) return hasPermission(role, "settings:view");
  if (pathname.startsWith("/admin/audit")) return hasPermission(role, "audit:view");
  return true;
}
