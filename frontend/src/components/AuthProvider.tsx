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

  // Normalize paths to avoid trailing slash issues
  const normalizePath = (value: string): string => {
    if (!value) return '/';
    const trimmed = value.replace(/\/+$/, '');
    return trimmed.length === 0 ? '/' : trimmed;
  };

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
      // Don't set auth error for network issues, just log them
      if (error instanceof Error && !error.message.includes('fetch')) {
        setAuthError(error.message);
      }
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
        const current = normalizePath(pathname || '/');
        const normalizedPublic = publicRoutes.map(normalizePath);
        const normalizedLoginOnly = loginOnlyRoutes.map(normalizePath);
        const isPublicRoute = normalizedPublic.includes(current);
        const isLoginOnlyRoute = normalizedLoginOnly.includes(current);
        
        // Check if we have a token in storage as a fallback
        const hasToken = typeof window !== 'undefined' && (
          localStorage.getItem('auth-token') || 
          document.cookie.includes('auth-token=')
        );
        
        console.log('Auth state check:', { 
          isAuthenticated, 
          pathname: current, 
          isPublicRoute, 
          isLoginOnlyRoute,
          authError,
          isInitializing,
          hasInitialized,
          hasToken
        });
        
        if (!isAuthenticated && !isPublicRoute) {
          // If we have a token but authentication failed, try to re-initialize
          if (hasToken) {
            console.log('Found token but not authenticated, attempting re-initialization...');
            initializeAuth().catch(console.error);
            return; // Don't redirect yet, let re-initialization complete
          }
          
          // User is not authenticated and trying to access a protected route
          console.log('Redirecting to login: not authenticated on protected route');
          router.push('/login');
        } else if (isAuthenticated && isLoginOnlyRoute) {
          // User is authenticated but on a login-only route, redirect to dashboard
          console.log('Redirecting to dashboard: authenticated on login-only route');
          router.push('/dashboard');
        }
        // Note: Authenticated users can now access /register and other non-login public routes
      }, 500); // Increased delay to 500ms for better state stability

      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, pathname, isInitializing, hasInitialized, router, publicRoutes, loginOnlyRoutes, authError, initializeAuth]);

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
          <p className="text-gray-600">Initializing authentication...</p>
          {authError && (
            <p className="text-red-500 text-sm mt-2">{authError}</p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            Debug: {isAuthenticated ? 'Authenticated' : 'Not authenticated'} | 
            {hasInitialized ? 'Initialized' : 'Not initialized'}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 