import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Debug log
  console.log('Middleware running for path:', request.nextUrl.pathname);

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  const { data: { session } } = await supabase.auth.getSession();

  // Debug log
  console.log('Session status:', session ? 'authenticated' : 'not authenticated');

  // Public paths that don't require authentication
  const publicPaths = ['/login'];
  const isPublicPath = publicPaths.includes(request.nextUrl.pathname);

  // If not authenticated and trying to access protected route
  if (!session && !isPublicPath) {
    console.log('Redirecting to login - no session');
    const redirectUrl = new URL('/login', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // If authenticated and trying to access login page
  if (session && isPublicPath) {
    console.log('Redirecting to map - has session');
    const redirectUrl = new URL('/map', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 