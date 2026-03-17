import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;

// El Pool de 'pg' es el que realmente maneja la conexión a Neon
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool as any);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // @ts-ignore - Necesario en algunas versiones de TS para el adaptador
    adapter: adapter,
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;