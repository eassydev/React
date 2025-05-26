import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Check if user has permission for a frontend URL based on stored permissions
 */
function hasPermissionForUrl(permissions: string[], pathname: string): boolean {
  if (!permissions || permissions.length === 0) {
    return false
  }

  return permissions.some(permission => {
    // Skip backend-only permissions
    if (!permission.startsWith('/admin')) {
      return false
    }

    // Exact match
    if (permission === pathname) {
      return true
    }

    // Wildcard matching
    if (permission.includes('*')) {
      const pattern = permission.replace(/\*/g, '.*')
      const regex = new RegExp(`^${pattern}$`)
      return regex.test(pathname)
    }

    // Base path matching (e.g., "/admin/category" allows "/admin/category/add")
    if (pathname.startsWith(permission + '/') || pathname === permission) {
      return true
    }

    return false
  })
}

export function roleMiddleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const tokenCookie = req.cookies.get("token")
  const token = tokenCookie?.value

  // Allow access to login page
  if (pathname === '/auth/login') {
    return NextResponse.next()
  }

  // Check if user is logged in
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  // For admin routes, we'll do a more lenient check here
  // and rely on component-level permission checking for granular control
  if (pathname.startsWith('/admin')) {
    // Allow access to main admin dashboard
    if (pathname === '/admin') {
      return NextResponse.next()
    }

    // For specific admin pages, we'll allow access here
    // and let the PermissionGuard component handle the detailed checking
    return NextResponse.next()
  }

  return NextResponse.next()
}
