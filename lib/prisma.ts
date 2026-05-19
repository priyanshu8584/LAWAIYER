import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  // eslint-disable-next-line no-var
  var _prisma: PrismaClient | undefined;
}

function getClient(): PrismaClient {
  if (global._prisma) return global._prisma;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set.");
  }

  const adapter = new PrismaPg({ connectionString });
  global._prisma = new PrismaClient({ adapter, log: ["error"] });
  return global._prisma;
}

// Proxy defers client construction until first property access (request time).
// This allows the module to be safely imported during Next.js build
// without DATABASE_URL being available.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
