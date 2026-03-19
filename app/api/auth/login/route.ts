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

    // NOTA: Para producción, la contraseña debería compararse con bcrypt
    if (!admin || admin.password !== password) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    // Generar el JWT con expiración de 7 días
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new jose.SignJWT({ id: admin.id, email: admin.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret);

    const response = NextResponse.json({ success: true, message: 'Login exitoso' });
    
    // Configurar la Cookie robusta
    response.cookies.set('admin_token', token, {
      httpOnly: true, // Inaccesible por JavaScript del cliente (Seguridad)
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 días en segundos
      path: '/',
    });

    return response;
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}