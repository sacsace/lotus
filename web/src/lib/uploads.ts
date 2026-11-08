import path from "node:path";
import { mkdir, unlink } from "node:fs/promises";

/** Local default: public/uploads. On Railway set UPLOAD_DIR=/data/uploads so files survive redeploys. */
export function getUploadRoot() {
  if (process.env.UPLOAD_DIR?.trim()) {
    return path.resolve(process.env.UPLOAD_DIR.trim());
  }
  return path.join(process.cwd(), "public", "uploads");
}

export function publicUploadUrl(category: string, filename: string) {
  return `/uploads/${category}/${filename}`;
}

export async function ensureUploadDir(category: string) {
  const dir = path.join(getUploadRoot(), category);
  await mkdir(dir, { recursive: true });
  return dir;
}

export function absoluteUploadPath(publicUrl: string) {
  if (!publicUrl.startsWith("/uploads/")) return null;
  const relative = publicUrl.slice("/uploads/".length);
  if (!relative || relative.includes("..")) return null;
  return path.join(getUploadRoot(), relative);
}

export async function tryDeleteUpload(publicUrl: string) {
  const filePath = absoluteUploadPath(publicUrl);
  if (!filePath) return;
  try {
    await unlink(filePath);
  } catch {
    // File may already be gone or was a static /images path.
  }
}
