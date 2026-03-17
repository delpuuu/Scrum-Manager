import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Leemos la URL de tu base de datos del archivo .env
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Evitamos que Next.js multiplique las conexiones en desarrollo
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // En Prisma 7, si usas una conexión directa estándar:
    datasourceUrl: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;