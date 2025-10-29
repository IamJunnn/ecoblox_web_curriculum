import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = ['/', '/login']

// Define role-based route patterns
const roleRoutes = {
  student: /^\/student\/.*/,
  teacher: /^\/teacher\/.*/,
  admin: /^\/admin\/.*/,
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Get token from cookies (we'll need to set this during login)
  const token = request.cookies.get('access_token')?.value
  const userRole = request.cookies.get('user_role')?.value

  // No token - redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Check role-based access
  if (pathname.startsWith('/student') && userRole !== 'student') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (pathname.startsWith('/teacher') && userRole !== 'teacher' && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (pathname.startsWith('/admin') && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (image files)
     * - Static file extensions
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.ico).*)',
  ],
}