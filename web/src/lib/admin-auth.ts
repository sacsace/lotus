import { SignJWT, jwtVerify } from "jose";
import type { AdminRole } from "@/lib/rbac";

const COOKIE_NAME = "lotus_admin";

export type AdminJwtPayload = {
  sub: string;
  email: string;
  name: string;
  role: AdminRole;
  tenantId?: string | null;
};

function getSecret() {
  return new TextEncoder().encode(
    process.env.LOTUS_ADMIN_JWT_SECRET || "fallback-dev-only-32-characters!",
  );
}

export async function createAdminJwt(payload: AdminJwtPayload): Promise<string> {
  return new SignJWT({
    email: payload.email,
    name: payload.name,
    role: payload.role,
    tenantId: payload.tenantId ?? null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());
}

export async function verifyAdminJwt(token: string): Promise<AdminJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const sub = payload.sub;
    if (!sub || typeof sub !== "string") return null;
    const email = payload.email;
    const name = payload.name;
    const role = payload.role;
    if (typeof email !== "string" || typeof name !== "string" || typeof role !== "string") {
      return null;
    }
    return {
      sub,
      email,
      name,
      role: role as AdminRole,
      tenantId: typeof payload.tenantId === "string" ? payload.tenantId : null,
    };
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
