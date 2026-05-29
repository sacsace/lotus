import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/admin-auth";
import { ADMIN_TENANT_COOKIE } from "@/lib/admin-api";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  const clear = {
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0,
  } as const;
  res.cookies.set({ name: COOKIE_NAME, ...clear });
  res.cookies.set({ name: ADMIN_TENANT_COOKIE, ...clear });
  return res;
}
