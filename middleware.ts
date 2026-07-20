import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes yang membutuhkan autentikasi admin
const PROTECTED_ROUTES = [
  '/',
  '/users',
  '/competitions',
  '/teams',
  '/admins',
  '/settings'
];

// Routes yang tidak boleh diakses jika sudah login
const AUTH_ROUTES = ['/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname === route || (route !== '/' && pathname.startsWith(route))
  );
  
  // Check if route is auth route
  const isAuthRoute = AUTH_ROUTES.some(route => 
    pathname.startsWith(route)
  );

  // Get auth token from cookies
  const authToken = request.cookies.get('sb-qxesqdjdiuuzhmgadewe-auth-token')?.value;
  
  // Redirect logic
  if (isProtectedRoute && !authToken) {
    // User trying to access protected route without auth - redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};