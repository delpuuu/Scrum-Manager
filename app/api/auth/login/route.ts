import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  // Validación dura para el Staff
  if (email === 'admin@scrum.com' && password === 'admin123') {
    // En una app real acá crearíamos una Cookie de sesión. 
    // Por ahora, le damos luz verde al frontend.
    return NextResponse.json({ message: "Login exitoso" }, { status: 200 });
  }

  return NextResponse.json(
    { error: "Credenciales inválidas" }, 
    { status: 401 }
  );
}