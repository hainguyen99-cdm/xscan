import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

// Routes that should redirect authenticated users to dashboard
const authRedirectRoutes = ['/login', '/forgot-password', '/reset-password'];

// Role-restricted routes - these require specific user roles
const roleRestrictedRoutes = {
  '/dashboard/obs-settings': ['streamer', 'admin'], // Only streamers and admins
  '/dashboard/streamer': ['streamer', 'admin'],     // Only streamers and admins
  '/dashboard/admin': ['admin'],                    // Only admins
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the route is public
  const isPublicRoute = publicRoutes.includes(pathname);
  const isAuthRedirectRoute = authRedirectRoutes.includes(pathname);
  
  // Get token from cookies (more reliable than localStorage for middleware)
  const token = request.cookies.get('auth-token')?.value;
  
  // If it's a public route, allow access
  if (isPublicRoute) {
    // If user is authenticated and trying to access auth routes, redirect to dashboard
    if (token && isAuthRedirectRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }
  
  // For protected routes, check if user is authenticated
  if (!token) {
    // Redirect to login if no token
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Check if this is a role-restricted route
  const restrictedRoute = Object.keys(roleRestrictedRoutes).find(route => 
    pathname.startsWith(route)
  );
  
  if (restrictedRoute) {
    // For role-restricted routes, we'll let the page handle role checking
    // This is because middleware can't easily make authenticated API calls
    // The page will check the user's role and show appropriate access denied message
    return NextResponse.next();
  }
  
  // User is authenticated, allow access to protected route
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 