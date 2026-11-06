import { spawn } from "node:child_process";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
let tenants = 0;

try {
  tenants = await prisma.tenant.count();
} finally {
  await prisma.$disconnect();
}

if (tenants > 0) {
  console.log("Database already has tenants. Skip seed.");
  process.exit(0);
}

console.log("Empty database. Seeding initial hotels.");
const child = spawn("npx", ["tsx", "prisma/seed.ts"], { stdio: "inherit" });
child.on("exit", (code) => process.exit(code ?? 1));
