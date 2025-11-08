import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware to protect routes that require authentication
 * Allows demo rooms (starting with 'demo-') to bypass authentication
 */
export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const pathname = req.nextUrl.pathname;

  const isCanvasRoute = pathname.startsWith('/canvas');
  

  const isDemoRoom = pathname.match(/\/canvas\/demo-/);

  // Protect canvas routes EXCEPT demo rooms
  if (!token && isCanvasRoute && !isDemoRoom) {
    return NextResponse.redirect(new URL('/signin', req.url));
  }

  return NextResponse.next();
}
