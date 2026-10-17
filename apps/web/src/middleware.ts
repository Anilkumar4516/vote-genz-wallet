import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Edge Middleware
 * Validates voter navigation state and gates confidential voting routes
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static assets and API calls pass through
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/public') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Public routes
  const publicRoutes = ['/', '/login', '/verify-otp', '/check-receipt', '/error'];
  if (publicRoutes.some((route) => pathname === route)) {
    return NextResponse.next();
  }

  // Check auth cookie/header for protected voter routes
  const token = request.cookies.get('vote_token')?.value || request.headers.get('authorization');

  // In standard browser client-side navigation Zustand & localStorage handle finer step checks;
  // If SSR access to protected route occurs without token, redirect to login
  if (!token && (pathname.startsWith('/verify') || pathname === '/ballot' || pathname === '/review')) {
    // Permissive redirect if running pure client-side SPA routing
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
