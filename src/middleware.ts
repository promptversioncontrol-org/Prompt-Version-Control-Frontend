import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const allowedOrigins = [
    'http://localhost:3000',
    'https://rewards-richards-classic-donor.trycloudflare.com',
  ];

  const origin = request.headers.get('origin');

  // Handle OPTIONS method
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      );
      response.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With',
      );
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
    return response;
  }

  // Define public routes that don't require authentication
  const publicRoutes = ['/', '/sign-in', '/sign-up', '/docs'];

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // Check for session token
  // better-auth uses 'better-auth.session_token' or '__Secure-better-auth.session_token'
  const sessionToken =
    request.cookies.get('better-auth.session_token') ||
    request.cookies.get('__Secure-better-auth.session_token');

  const isAuthenticated = !!sessionToken;

  // 1. If user is authenticated
  if (isAuthenticated) {
    // Redirect to dashboard if trying to access sign-in or sign-up
    if (pathname === '/sign-in' || pathname === '/sign-up') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  // 2. If user is NOT authenticated
  else {
    // Redirect to sign-in if trying to access a protected route
    // Skip redirect for API routes to avoid returning HTML to API clients
    if (!isPublicRoute && !pathname.startsWith('/api')) {
      // Create the redirect URL
      const url = new URL('/sign-in', request.url);
      // Optional: Add callback URL to redirect back after login
      // url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  const response = NextResponse.next();

  // Apply CORS headers to the response
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With',
    );
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next/static|_next/image|favicon.ico|icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
