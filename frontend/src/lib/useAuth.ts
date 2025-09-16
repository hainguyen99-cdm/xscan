import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  role: 'admin' | 'streamer' | 'donor';
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  timezone?: string;
  notifications?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy?: {
    profilePublic: boolean;
    showEmail: boolean;
    showLocation: boolean;
  };
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  status: 'active' | 'suspended' | 'pending';
  createdAt: string;
  lastLoginAt?: string;
}

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  getAuthHeader: () => string | null;
  refreshUser: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // Get token from localStorage or sessionStorage
  const getStoredToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    // Try localStorage first, then sessionStorage
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  }, []);

  // Store token in storage
  const storeToken = useCallback((newToken: string, rememberMe: boolean = false) => {
    if (typeof window === 'undefined') return;
    
    if (rememberMe) {
      localStorage.setItem('authToken', newToken);
    } else {
      sessionStorage.setItem('authToken', newToken);
    }
    setToken(newToken);
  }, []);

  // Remove token from storage
  const removeToken = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    setToken(null);
  }, []);

  // Get authentication header for API calls
  const getAuthHeader = useCallback(() => {
    const currentToken = token || getStoredToken();
    return currentToken ? `Bearer ${currentToken}` : null;
  }, [token]);

  // Fetch user profile
  const fetchUserProfile = useCallback(async (authToken: string) => {
    try {
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const userData = await response.json();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // This would typically call your login API endpoint
      // For now, we'll simulate a login process
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const { token: authToken, user: userData } = await response.json();
      
      // Store token and user data
      storeToken(authToken, true); // Remember user by default
      setUser(userData);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [storeToken]);

  // Logout function
  const logout = useCallback(() => {
    removeToken();
    setUser(null);
  }, [removeToken]);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    const currentToken = getStoredToken();
    if (currentToken) {
      try {
        await fetchUserProfile(currentToken);
      } catch (error) {
        // If refresh fails, logout user
        logout();
      }
    }
  }, [getStoredToken, fetchUserProfile, logout]);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = getStoredToken();
      
      if (storedToken) {
        try {
          setToken(storedToken); // Set the token state
          await fetchUserProfile(storedToken);
        } catch (error) {
          // If stored token is invalid, remove it
          removeToken();
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, [getStoredToken, fetchUserProfile, removeToken]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user && (!!token || !!getStoredToken()), // Check both state and storage
    login,
    logout,
    getAuthHeader,
    refreshUser,
  };
} 