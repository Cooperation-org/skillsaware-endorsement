import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /form/* routes
  if (!pathname.startsWith('/form/')) {
    return NextResponse.next();
  }

  // Extract token from query param or cookie
  const tokenFromQuery = request.nextUrl.searchParams.get('token');
  const tokenFromCookie = request.cookies.get('token')?.value;

  const token = tokenFromQuery || tokenFromCookie;

  if (!token) {
    return NextResponse.redirect(new URL('/error/invalid-token', request.url));
  }

  try {
    // Verify token
    await verifyToken(token);

    // If token came from query param, set it in cookie and redirect to clean URL
    if (tokenFromQuery) {
      const response = NextResponse.redirect(new URL(pathname, request.url));
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });
      return response;
    }

    // Token valid, continue to page
    const response = NextResponse.next();
    return response;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'TOKEN_EXPIRED') {
        return NextResponse.redirect(new URL('/error/token-expired', request.url));
      }
    }
    return NextResponse.redirect(new URL('/error/invalid-token', request.url));
  }
}

export const config = {
  matcher: '/form/:path*',
};
