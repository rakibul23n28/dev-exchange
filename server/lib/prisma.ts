import { PrismaClient } from "@db"; // Ensure this points to your generated client
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = `${process.env.DATABASE_URL}`;

// 1. Limit the pool size for Serverless
const pool = new pg.Pool({
  connectionString,
  max: 1, // Only 1 connection per serverless function instance
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Fail fast if DB is unreachable
});

const adapter = new PrismaPg(pool);

// 2. Fix the global type for TS (prevents build errors)
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    // Optional: useful for debugging Vercel logs
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
