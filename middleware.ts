import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Check if user is approved for instructor/admin routes
    if (
      (pathname.startsWith('/instructor') || pathname.startsWith('/admin')) &&
      token?.role !== 'admin' &&
      !token?.isApproved
    ) {
      return NextResponse.redirect(new URL('/dashboard?error=not-approved', req.url));
    }

    // Admin routes
    if (pathname.startsWith('/admin') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard?error=unauthorized', req.url));
    }

    // Instructor routes
    if (pathname.startsWith('/instructor') && token?.role !== 'instructor' && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard?error=unauthorized', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        
        // Public routes
        if (pathname.startsWith('/auth') || pathname === '/' || pathname.startsWith('/courses')) {
          return true;
        }

        // Protected routes require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/instructor/:path*',
    '/admin/:path*',
    '/courses/:path*/watch',
  ],
};