import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server'; // Corregido: de 'next/server'

export function middleware(request: NextRequest) {
  // Por ahora, el guardián deja pasar a todos. 
  // Una vez que confirmemos que el login visual anda, activamos la seguridad.
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'], // Solo aplica a rutas que empiecen con /admin
};