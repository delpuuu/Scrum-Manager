import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';

// Cargamos el archivo .env manualmente para que Prisma 7 lo vea
dotenv.config();

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    // Si sigue fallando, podés poner el string directo aquí para probar, 
    // pero lo ideal es usar la variable de entorno:
    url: process.env.DATABASE_URL,
  },
});