import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';
import path from 'path';

// Cargamos el .env usando una ruta absoluta basada en el directorio raíz
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  // En Vercel, la URL ya está en el entorno, esto es principalmente para local
  console.warn("DATABASE_URL no detectada en el entorno local.");
}

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: databaseUrl || "",
  },
});