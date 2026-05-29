import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { requirePermission } from "@/lib/admin-api";

const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const MAX_BYTES = 8 * 1024 * 1024;

function sanitize(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
}

export async function POST(req: Request) {
  const session = await requirePermission("content:edit");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  const category = String(form.get("category") ?? "hero").replace(/[^a-z0-9_-]/gi, "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 8MB)" }, { status: 400 });
  }

  const dir = path.join(process.cwd(), "public", "uploads", category || "hero");
  await mkdir(dir, { recursive: true });

  const timestamp = Date.now();
  const safeName = sanitize(file.name || "upload");
  const filename = `${timestamp}-${safeName}`;
  const filePath = path.join(dir, filename);
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, bytes);

  const url = `/uploads/${category || "hero"}/${filename}`;
  return NextResponse.json({ url, filename, size: file.size, type: file.type });
}
