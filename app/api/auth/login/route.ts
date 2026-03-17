import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  // CREDENCIALES ACTUALIZADAS: LucianoAbatedaga
  if (email === 'LucianoAbatedaga' && password === 'Torque_2026_Scrum') {
    const response = NextResponse.json({ message: "Login exitoso" });
    
    // Seteamos la Cookie de sesión
    response.cookies.set('auth_token', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 horas
    });

    return response;
  }

  return NextResponse.json({ error: "Usuario o clave incorrectos" }, { status: 401 });
}