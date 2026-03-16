import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // BYPASS: Verificamos directamente acá sin consultar a la base de datos
    // Esto evita cualquier cuelgue si Prisma está bloqueado localmente.
    if (email === 'admin@scrum.com' && password === 'admin123') {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}