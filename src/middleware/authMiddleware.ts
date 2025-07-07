import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function authMiddleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLoggedIn = req.cookies.get('token');

  // Public routes that don't require authentication
  const publicRoutes = ['/contact-us', '/auth/login'];

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  if (!isLoggedIn && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  if (isLoggedIn && pathname === '/auth/login') {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  return NextResponse.next();
}
