import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';

// Forzamos la carga del archivo .env al inicio
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL no está definida en el archivo .env");
}

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
});