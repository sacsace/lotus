import { createReadStream, existsSync, statSync } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { getUploadRoot } from "@/lib/uploads";

const TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(_req: Request, ctx: Ctx) {
  const parts = (await ctx.params).path ?? [];
  if (parts.length === 0 || parts.some((p) => p.includes("..") || p.includes("\\") || p.includes("/"))) {
    return new Response("Not found", { status: 404 });
  }

  const filePath = path.join(getUploadRoot(), ...parts);
  const root = getUploadRoot();
  if (!filePath.startsWith(root) || !existsSync(filePath) || !statSync(filePath).isFile()) {
    return new Response("Not found", { status: 404 });
  }

  const ext = path.extname(filePath).toLowerCase();
  const type = TYPES[ext] ?? "application/octet-stream";
  const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream;

  return new Response(stream, {
    headers: {
      "Content-Type": type,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
