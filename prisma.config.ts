import { defineConfig } from '@prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    // Prisma 7 requiere que la URL esté presente aquí para comandos como 'db push'
    url: process.env.DATABASE_URL as string,
  },
});