// src/lib/prisma.ts
// Singleton PrismaClient — prevents "Too many connections" during hot-reload.

import { PrismaClient } from "@prisma/client";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

// Standard setup for Neon serverless with WebSockets in Node.js
if (typeof window === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  // Use the Neon adapter for serverless/edge compatibility
  console.log("Initializing Prisma with Neon adapter...");
  const pool = new Pool({ connectionString });
  // @ts-ignore
  const adapter = new PrismaNeon(pool);
  console.log("Adapter created successfully.");

  return new PrismaClient({
    // @ts-ignore
    adapter,
    // @ts-ignore - Prisma 7 might need this if url is removed from schema
    datasourceUrl: connectionString,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
