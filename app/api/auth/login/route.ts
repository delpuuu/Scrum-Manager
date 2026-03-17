import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (email === 'admin@scrum.com' && password === 'admin123') {
    const response = NextResponse.json({ message: "Login exitoso" });
    
    // Guardamos la sesión en una Cookie (accesible por el middleware)
    response.cookies.set('auth_token', 'true', {
      httpOnly: true, // Seguridad: no accesible por JS del cliente
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 horas
    });

    return response;
  }

  return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
}