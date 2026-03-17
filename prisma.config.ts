import { defineConfig } from '@prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  // Prisma 7 CLI buscará automáticamente DATABASE_URL en el entorno o en el .env
  datasource: {
    url: process.env.DATABASE_URL,
  },
});