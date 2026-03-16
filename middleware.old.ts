import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  // Buscamos la cookie que creamos en la API
  const token = request.cookies.get('auth_token')?.value;

  // Solo protegemos las rutas que empiezan con /admin (excepto el propio login)
  if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')) {
    
    // Si no hay token, lo rebotamos al login
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      // Verificamos que el token sea válido y no esté vencido
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      
      return NextResponse.next(); // Todo ok, lo dejamos pasar
    } catch (error) {
      // Si alguien inventó un token falso o se venció, lo rebotamos
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

// Le decimos a Next.js en qué rutas tiene que ejecutar este candado
export const config = {
  matcher: ['/admin/:path*'],
};