'use client';

import { useEffect, useState, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from '@/store';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isAuthenticated, initializeAuth } = useAppStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  
  // Routes that authenticated users should be redirected from (login-related only)
  const loginOnlyRoutes = ['/login', '/forgot-password', '/reset-password'];

  // Memoize the initialization function to prevent unnecessary re-renders
  const initializeAuthentication = useCallback(async () => {
    try {
      console.log('Starting authentication initialization...');
      setAuthError(null);
      
      // Initialize authentication state from store
      await initializeAuth();
      console.log('Authentication initialization completed');
    } catch (error) {
      console.error('Failed to initialize authentication:', error);
      setAuthError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsInitializing(false);
      setHasInitialized(true);
    }
  }, [initializeAuth]);

  useEffect(() => {
    initializeAuthentication();
  }, [initializeAuthentication]);

  useEffect(() => {
    // Only run redirects after initialization is complete AND we've had a chance to initialize
    if (!isInitializing && hasInitialized) {
      console.log('Running authentication checks for path:', pathname);
      
      // Add a small delay to ensure authentication state is stable
      const timeoutId = setTimeout(() => {
        const isPublicRoute = publicRoutes.includes(pathname);
        const isLoginOnlyRoute = loginOnlyRoutes.includes(pathname);
        
        console.log('Auth state check:', { 
          isAuthenticated, 
          pathname, 
          isPublicRoute, 
          isLoginOnlyRoute,
          authError
        });
        
        if (!isAuthenticated && !isPublicRoute) {
          // User is not authenticated and trying to access a protected route
          console.log('Redirecting to login: not authenticated on protected route');
          router.push('/login');
        } else if (isAuthenticated && isLoginOnlyRoute) {
          // User is authenticated but on a login-only route, redirect to dashboard
          console.log('Redirecting to dashboard: authenticated on login-only route');
          router.push('/dashboard');
        }
        // Note: Authenticated users can now access /register and other non-login public routes
      }, 150); // Increased delay to 150ms for better state stability

      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, pathname, isInitializing, hasInitialized, router, publicRoutes, loginOnlyRoutes, authError]);

  // Add a periodic token validation check (every 5 minutes)
  useEffect(() => {
    if (!isAuthenticated || isInitializing) return;

    const intervalId = setInterval(async () => {
      try {
        console.log('Performing periodic token validation...');
        await initializeAuth();
      } catch (error) {
        console.error('Periodic token validation failed:', error);
        setAuthError('Token validation failed');
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(intervalId);
  }, [isAuthenticated, isInitializing, initializeAuth]);

  // Show loading while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing...</p>
          {authError && (
            <p className="text-red-500 text-sm mt-2">{authError}</p>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 