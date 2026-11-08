import { NextResponse } from "next/server";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { requirePermission } from "@/lib/admin-api";
import { ensureUploadDir, publicUploadUrl } from "@/lib/uploads";

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
    return NextResponse.json({ error: "지원하지 않는 파일 형식입니다." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "파일이 너무 큽니다. (최대 8MB)" }, { status: 400 });
  }

  const dir = await ensureUploadDir(category || "hero");
  const timestamp = Date.now();
  const safeName = sanitize(file.name || "upload");
  const filename = `${timestamp}-${safeName}`;
  const filePath = path.join(dir, filename);
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, bytes);

  const url = publicUploadUrl(category || "hero", filename);
  return NextResponse.json({ url, filename, size: file.size, type: file.type });
}
