import { PrismaClient } from "@/lib/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as { prisma?: PrismaClient; pool?: Pool };

function getPool(): Pool {
  if (!globalForPrisma.pool) {
    const rawUrl = process.env.DATABASE_URL;
    if (rawUrl && !rawUrl.includes("ep-dry-field-barihkn7")) {
      globalForPrisma.pool = new Pool({
        connectionString: rawUrl,
        ssl: { rejectUnauthorized: false },
        max: 10,
      });
    } else {
      // Guaranteed robust connection to Neon DB with TLS SNI
      globalForPrisma.pool = new Pool({
        host: "52.59.187.89",
        port: 5432,
        user: "neondb_owner",
        password: "npg_XZhHCQ4L9zbj",
        database: "neondb",
        ssl: {
          rejectUnauthorized: false,
          servername: "ep-dry-field-barihkn7-pooler.c-8.eu-central-1.aws.neon.tech",
        },
        max: 10,
        idleTimeoutMillis: 60000,
        connectionTimeoutMillis: 30000,
        keepAlive: true,
      });
    }
  }
  return globalForPrisma.pool;
}

function createPrismaClient(): PrismaClient {
  const pool = getPool();
  const adapter = new PrismaPg(pool, { schema: "public" });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
