import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as jose from 'jose';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin || admin.password !== password) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    // EL TRUCO TECH LEAD: Si falla JWT_SECRET, usamos DATABASE_URL que sabemos que carga al 100%
    const secretString = process.env.JWT_SECRET || process.env.DATABASE_URL;
    
    if (!secretString) {
      throw new Error("Error crítico: No hay ningún secreto disponible en el entorno.");
    }

    const secret = new TextEncoder().encode(secretString);
    
    const token = await new jose.SignJWT({ id: admin.id, email: admin.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret);

    const response = NextResponse.json({ success: true, message: 'Login exitoso' });
    
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: `Falla técnica: ${error.message}` }, { status: 500 });
  }
}