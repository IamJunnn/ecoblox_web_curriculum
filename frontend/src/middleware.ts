import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = ['/', '/login', '/the-admin-page']

// Define role-based route patterns
const roleRoutes = {
  student: /^\/student\/.*/,
  teacher: /^\/teacher\/.*/,
  admin: /^\/admin\/.*/,
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log('\n🛡️  ========== MIDDLEWARE CHECK ==========')
  console.log(`[Middleware] Checking path: ${pathname}`)
  console.log(`[Middleware] Timestamp: ${new Date().toISOString()}`)

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    console.log(`[Middleware] ✓ Public route, allowing access`)
    console.log('==========================================\n')
    return NextResponse.next()
  }

  // Get token from cookies
  const token = request.cookies.get('access_token')?.value
  const userRole = request.cookies.get('user_role')?.value

  // Debug logging - show all cookies
  const allCookies = request.cookies.getAll()
  console.log(`[Middleware] Total cookies found: ${allCookies.length}`)
  allCookies.forEach(cookie => {
    console.log(`[Middleware] Cookie: ${cookie.name} = ${cookie.value.substring(0, 20)}...`)
  })

  console.log(`[Middleware] access_token: ${token ? 'EXISTS (' + token.substring(0, 20) + '...)' : '❌ MISSING'}`)
  console.log(`[Middleware] user_role: ${userRole || '❌ MISSING'}`)

  // No token - redirect to login
  if (!token) {
    console.log(`[Middleware] ❌ No token found, redirecting to /`)
    console.log('==========================================\n')
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Check role-based access
  if (pathname.startsWith('/student') && userRole !== 'student') {
    console.log(`[Middleware] ❌ Student route but role is '${userRole}', redirecting to /`)
    console.log('==========================================\n')
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (pathname.startsWith('/teacher') && userRole !== 'teacher' && userRole !== 'admin') {
    console.log(`[Middleware] ❌ Teacher route but role is '${userRole}', redirecting to /`)
    console.log('==========================================\n')
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (pathname.startsWith('/admin') && userRole !== 'admin') {
    console.log(`[Middleware] ❌ Admin route but role is '${userRole}', redirecting to /`)
    console.log(`[Middleware] Expected: 'admin', Got: '${userRole}'`)
    console.log('==========================================\n')
    return NextResponse.redirect(new URL('/', request.url))
  }

  console.log(`[Middleware] ✓ Access GRANTED to ${pathname}`)
  console.log(`[Middleware] User role '${userRole}' has permission`)
  console.log('==========================================\n')
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