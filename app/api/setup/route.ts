import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const adminEmail = 'admin@scrum.com';
    
    // Buscamos si ya existe
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      // Si no existe, lo creamos a la fuerza
      await prisma.admin.create({
        data: {
          email: adminEmail,
          password: 'admin123',
        },
      });
      return NextResponse.json({ message: '✅ ÉXITO: Admin creado. Email: admin@scrum.com / Pass: admin123. Ya podés ir al Login.' });
    }

    return NextResponse.json({ message: 'ℹ️ El admin ya existía en la base de datos. Usá admin@scrum.com y admin123' });
  } catch (error) {
    console.error("Error al crear admin:", error);
    return NextResponse.json({ error: '❌ Error: ¿Corriste npx prisma db push? La tabla Admin no existe.' }, { status: 500 });
  }
}