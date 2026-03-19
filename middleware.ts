import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

export async function middleware(request: NextRequest) {
  // Solo protegemos las rutas que empiezan con /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin_token')?.value;

    // Si no hay cookie, lo pateamos al login
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Verificamos matemáticamente que el token sea nuestro y no haya expirado
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jose.jwtVerify(token, secret);
      
      return NextResponse.next();
    } catch (error) {
      // Si el token es inválido o expiró, lo pateamos al login y limpiamos la cookie
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('admin_token');
      return response;
    }
  }
  
  return NextResponse.next();
}

// Configuración para que el middleware solo se ejecute donde importa y no ralentice la app
export const config = {
  matcher: ['/admin/:path*'],
};