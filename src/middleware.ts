import { NextRequest, NextResponse } from "next/server"

import { authMiddleware } from "./middleware/authMiddleware"
import { roleMiddleware } from "./middleware/roleMiddleware"

export function middleware(req: NextRequest) {
  // authMiddleware - Check if user is logged in
  const response = authMiddleware(req)
  if (response) {
    return response
  }

  // roleMiddleware - Check if user has permission for the route
  const roleResponse = roleMiddleware(req)
  if (roleResponse) {
    return roleResponse
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/auth/login", "/contact-us"],
}
