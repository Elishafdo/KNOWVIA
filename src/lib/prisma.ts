import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// On Vercel / serverless runtime with SQLite, ensure the DB is copied to writable /tmp
if (process.env.VERCEL && (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith("file:"))) {
  const tmpDbPath = "/tmp/dev.db";
  if (!fs.existsSync(tmpDbPath)) {
    const candidates = [
      path.join(process.cwd(), "prisma", "dev.db"),
      path.join(process.cwd(), "dev.db"),
      path.resolve("prisma/dev.db"),
      "/var/task/prisma/dev.db",
      "/var/task/dev.db",
    ];
    for (const src of candidates) {
      if (fs.existsSync(src)) {
        try {
          fs.copyFileSync(src, tmpDbPath);
          break;
        } catch (e) {
          console.error("Failed to copy SQLite db to /tmp:", e);
        }
      }
    }
  }

  if (fs.existsSync(tmpDbPath)) {
    process.env.DATABASE_URL = "file:/tmp/dev.db";
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
