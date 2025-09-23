import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, PaginatedResponse, User, Wallet, Transaction, BankAccount, CreateBankAccountDto, UpdateBankAccountDto, BankListResponse } from '@/types';

// Token storage key
const TOKEN_KEY = 'auth-token'; // Changed to match middleware cookie name

// Create axios instance with default configuration
// Use configured API URL or fallback based on environment
const resolveBaseUrl = (): string => {
  // In browser, use the configured API URL or current origin
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || window.location.origin;
  }
  // On server side, use the configured API URL or fallback
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
};

export const api: AxiosInstance = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 10000, // Reduced timeout to 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access - clear the token
      console.log('401 Unauthorized - clearing token');
      removeAuthToken();
      delete api.defaults.headers.common.Authorization;
      
      // If we're not on a public route, redirect to login
      if (typeof window !== 'undefined') {
        const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
        const currentPath = window.location.pathname;
        if (!publicRoutes.includes(currentPath)) {
          // Add a small delay to prevent rapid redirects
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        }
      }
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const apiEndpoints = {
  // Authentication
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh',
    profile: '/api/auth/profile',
  },
  
  // Targets
  targets: {
    list: '/api/targets',
    create: '/api/targets',
    get: (id: string) => `/api/targets/${id}`,
    update: (id: string) => `/api/targets/${id}`,
    delete: (id: string) => `/api/targets/${id}`,
  },
  
  // Scans
  scans: {
    list: '/api/scans',
    create: '/api/scans',
    get: (id: string) => `/api/scans/${id}`,
    update: (id: string) => `/api/scans/${id}`,
    delete: (id: string) => `/api/scans/${id}`,
    start: (id: string) => `/api/scans/${id}/start`,
    stop: (id: string) => `/api/scans/${id}/stop`,
    results: (id: string) => `/api/scans/${id}/results`,
    logs: (id: string) => `/api/scans/${id}/logs`,
  },
  
  // Projects
  projects: {
    list: '/api/projects',
    create: '/api/projects',
    get: (id: string) => `/api/projects/${id}`,
    update: (id: string) => `/api/projects/${id}`,
    delete: (id: string) => `/api/projects/${id}`,
    members: (id: string) => `/api/projects/${id}/members`,
  },
  
  // Users
  users: {
    list: '/api/users',
    get: (id: string) => `/api/users/${id}`,
    update: (id: string) => `/api/users/${id}`,
    activate: (id: string) => `/api/users/${id}/activate`,
    deactivate: (id: string) => `/api/users/${id}/deactivate`,
    delete: (id: string) => `/api/users/${id}`,
    stats: '/api/users/stats',
    discoverStreamers: '/api/users/discover/streamers',
  },

  // Wallets
  wallets: {
    create: '/api/wallets',
    get: (id: string) => `/api/wallets/${id}`,
    getByUser: (userId: string) => `/api/wallets/user/${userId}`,
    addFunds: (id: string) => `/api/wallets/${id}/add-funds`,
    withdrawFunds: (id: string) => `/api/wallets/${id}/withdraw-funds`,
    transferFunds: (id: string) => `/api/wallets/${id}/transfer-funds`,
    getBalance: (id: string) => `/api/wallets/${id}/balance`,
    getTransactions: (id: string) => `/api/wallets/${id}/transactions`,
    getTransaction: (id: string, transactionId: string) => `/api/wallets/${id}/transactions/${transactionId}`,
    getTransactionsByType: (id: string, type: string) => `/api/wallets/${id}/transactions/type/${type}`,
    getTransactionStats: (id: string) => `/api/wallets/${id}/transaction-stats`,
    processDonation: (id: string) => `/api/wallets/${id}/donate`,
    processFee: (id: string) => `/api/wallets/${id}/process-fee`,
    deactivate: (id: string) => `/api/wallets/${id}/deactivate`,
    reactivate: (id: string) => `/api/wallets/${id}/reactivate`,
  },

  // Admin
  admin: {
    users: {
      list: '/api/admin/users',
      get: (id: string) => `/api/admin/users/${id}`,
      update: (id: string) => `/api/admin/users/${id}`,
      updateStatus: (id: string) => `/api/admin/users/${id}/status`,
      verify: (id: string) => `/api/admin/users/${id}/verify`,
      unverify: (id: string) => `/api/admin/users/${id}/verify`,
      delete: (id: string) => `/api/admin/users/${id}`,
    },
  },
};

// API functions
export const apiClient = {
  // Authentication
  auth: {
    // Backend returns top-level fields: { access_token, user }
    login: async (email: string, password: string): Promise<{ access_token: string; user: User }> => {
      const response = await api.post(apiEndpoints.auth.login, { email, password });
      return response.data;
    },
    
    register: async (
      email: string, 
      password: string, 
      firstName: string,
      lastName: string,
      role: string
    ): Promise<{ access_token: string; user: User }> => {
      const response = await api.post(apiEndpoints.auth.register, { 
        email, 
        password, 
        firstName,
        lastName,
        role
      });
      return response.data;
    },
    
    logout: async (): Promise<ApiResponse<void>> => {
      const response = await api.post(apiEndpoints.auth.logout);
      return response.data;
    },
    
    getProfile: async (): Promise<{ user: User }> => {
      const response = await api.get(apiEndpoints.auth.profile);
      return response.data;
    },
  },
  
  // Targets
  targets: {
    list: async (params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<any>> => {
      const response = await api.get(apiEndpoints.targets.list, { params });
      return response.data;
    },
    
    create: async (data: any): Promise<ApiResponse<any>> => {
      const response = await api.post(apiEndpoints.targets.create, data);
      return response.data;
    },
    
    get: async (id: string): Promise<ApiResponse<any>> => {
      const response = await api.get(apiEndpoints.targets.get(id));
      return response.data;
    },
    
    update: async (id: string, data: any): Promise<ApiResponse<any>> => {
      const response = await api.put(apiEndpoints.targets.update(id), data);
      return response.data;
    },
    
    delete: async (id: string): Promise<ApiResponse<void>> => {
      const response = await api.delete(apiEndpoints.targets.delete(id));
      return response.data;
    },
  },
  
  // Scans
  scans: {
    list: async (params?: { page?: number; limit?: number; targetId?: string; status?: string }): Promise<PaginatedResponse<any>> => {
      const response = await api.get(apiEndpoints.scans.list, { params });
      return response.data;
    },
    
    create: async (data: any): Promise<ApiResponse<any>> => {
      const response = await api.post(apiEndpoints.scans.create, data);
      return response.data;
    },
    
    get: async (id: string): Promise<ApiResponse<any>> => {
      const response = await api.get(apiEndpoints.scans.get(id));
      return response.data;
    },
    
    update: async (id: string, data: any): Promise<ApiResponse<any>> => {
      const response = await api.put(apiEndpoints.scans.update(id), data);
      return response.data;
    },
    
    delete: async (id: string): Promise<ApiResponse<void>> => {
      const response = await api.delete(apiEndpoints.scans.delete(id));
      return response.data;
    },
  },
  
  // Projects
  projects: {
    list: async (): Promise<ApiResponse<any>> => {
      const response = await api.get(apiEndpoints.projects.list);
      return response.data;
    },
    
    create: async (data: any): Promise<ApiResponse<any>> => {
      const response = await api.post(apiEndpoints.projects.create, data);
      return response.data;
    },
    
    get: async (id: string): Promise<ApiResponse<any>> => {
      const response = await api.get(apiEndpoints.projects.get(id));
      return response.data;
    },
    
    update: async (id: string, data: any): Promise<ApiResponse<any>> => {
      const response = await api.put(apiEndpoints.projects.update(id), data);
      return response.data;
    },
    
    delete: async (id: string): Promise<ApiResponse<void>> => {
      const response = await api.delete(apiEndpoints.projects.delete(id));
      return response.data;
    },
  },
  
  // Users
  users: {
    list: async (): Promise<ApiResponse<User[]>> => {
      const response = await api.get(apiEndpoints.users.list);
      return response.data;
    },
    
    get: async (id: string): Promise<ApiResponse<User>> => {
      const response = await api.get(apiEndpoints.users.get(id));
      return response.data;
    },
    
    update: async (id: string, data: Partial<User>): Promise<ApiResponse<User>> => {
      const response = await api.put(apiEndpoints.users.update(id), data);
      return response.data;
    },

    activate: async (id: string): Promise<ApiResponse<User>> => {
      const response = await api.patch(apiEndpoints.users.activate(id));
      return response.data;
    },

    deactivate: async (id: string): Promise<ApiResponse<User>> => {
      const response = await api.patch(apiEndpoints.users.deactivate(id));
      return response.data;
    },

    delete: async (id: string): Promise<ApiResponse<void>> => {
      const response = await api.delete(apiEndpoints.users.delete(id));
      return response.data;
    },

    stats: async (): Promise<ApiResponse<{ totalUsers: number; activeUsers: number; inactiveUsers: number }>> => {
      const response = await api.get(apiEndpoints.users.stats);
      return response.data;
    },

    discoverStreamers: async (params?: { 
      search?: string; 
      category?: string; 
      page?: number; 
      limit?: number 
    }): Promise<{ streamers: any[]; pagination: any }> => {
      const response = await api.get(apiEndpoints.users.discoverStreamers, { params });
      return response.data;
    },
  },

  // Admin
  admin: {
    users: {
      list: async (params?: { page?: number; limit?: number; searchTerm?: string; role?: string; status?: string }): Promise<any> => {
        const response = await api.get(apiEndpoints.admin.users.list, { params });
        return response.data;
      },
      get: async (id: string): Promise<any> => {
        const response = await api.get(apiEndpoints.admin.users.get(id));
        return response.data;
      },
      update: async (id: string, data: any): Promise<any> => {
        const response = await api.put(apiEndpoints.admin.users.update(id), data);
        return response.data;
      },
      updateStatus: async (id: string, status: 'active' | 'inactive' | 'suspended', reason?: string): Promise<any> => {
        const response = await api.post(apiEndpoints.admin.users.updateStatus(id), { status, reason });
        return response.data;
      },
      verify: async (id: string): Promise<any> => {
        const response = await api.post(apiEndpoints.admin.users.verify(id));
        return response.data;
      },
      unverify: async (id: string): Promise<any> => {
        const response = await api.delete(apiEndpoints.admin.users.unverify(id));
        return response.data;
      },
      delete: async (id: string): Promise<any> => {
        const response = await api.delete(apiEndpoints.admin.users.delete(id));
        return response.data;
      },
    },
  },

  // Wallets
  wallets: {
    create: async (data: { currency: string }): Promise<ApiResponse<Wallet>> => {
      const response = await api.post(apiEndpoints.wallets.create, data);
      return response.data;
    },
    getByUser: async (userId: string): Promise<ApiResponse<Wallet>> => {
      const response = await api.get(apiEndpoints.wallets.getByUser(userId));
      return response.data;
    },
    getTransactions: async (walletId: string): Promise<ApiResponse<Transaction[]>> => {
      const response = await api.get(apiEndpoints.wallets.getTransactions(walletId));
      return response.data;
    },
    addFunds: async (walletId: string, data: { amount: number; description?: string }): Promise<ApiResponse<Wallet>> => {
      const response = await api.post(apiEndpoints.wallets.addFunds(walletId), data);
      return response.data;
    },
    withdrawFunds: async (walletId: string, data: { amount: number; description?: string }): Promise<ApiResponse<Wallet>> => {
      const response = await api.post(apiEndpoints.wallets.withdrawFunds(walletId), data);
      return response.data;
    },
    transferFunds: async (walletId: string, data: { toUserId: string; amount: number; description?: string }): Promise<ApiResponse<Wallet>> => {
      const response = await api.post(apiEndpoints.wallets.transferFunds(walletId), data);
      return response.data;
    },
  },
};

// OBS Settings API functions
export const obsSettingsApi = {
  // Get current user's OBS settings
  async getMySettings(): Promise<any> {
    const response = await api.get('/api/obs-settings/my-settings');
    return response.data;
  },

  // Create new OBS settings
  async createSettings(data: any): Promise<any> {
    const response = await api.post('/api/obs-settings', data);
    return response.data;
  },

  // Update existing OBS settings
  async updateSettings(data: any): Promise<any> {
    const response = await api.patch('/api/obs-settings/my-settings', data);
    return response.data;
  },

  // Test OBS alert
  async testAlert(data: any): Promise<any> {
    const response = await api.post('/api/obs-settings/my-settings/test-alert', data);
    return response.data;
  },

  // Test OBS connection
  async testConnection(): Promise<any> {
    const response = await api.post('/api/obs-settings/my-widget-url/test-connection');
    return response.data;
  }
};

// Token management helpers
export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    // Store in cookies to match middleware expectations
    document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`;
    // Also store in localStorage as backup
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function getStoredToken(): string | null {
  if (typeof window !== 'undefined') {
    // Try cookies first (matches middleware)
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => cookie.trim().startsWith(`${TOKEN_KEY}=`));
    if (authCookie) {
      const token = authCookie.split('=')[1];
      // Restore to localStorage as backup
      localStorage.setItem(TOKEN_KEY, token);
      return token;
    }
    
    // Fallback to localStorage
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

export function removeAuthToken() {
  if (typeof window !== 'undefined') {
    // Remove from cookies
    document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    // Remove from localStorage
    localStorage.removeItem(TOKEN_KEY);
  }
}

export async function validateAuthToken(): Promise<{ isValid: boolean; user: User | null }> {
  try {
    console.log('Validating auth token...');
    const token = getStoredToken();
    console.log('Stored token found:', !!token);
    
    if (!token) {
      console.log('No token found, returning invalid');
      return { isValid: false, user: null };
    }
    
    const response = await apiClient.auth.getProfile();
    console.log('Profile response:', response);
    
    // Backend returns { user: {...} } directly, not wrapped in ApiResponse
    if (response && response.user) {
      console.log('Token validation successful, user:', response.user.username);
      return { isValid: true, user: response.user };
    }
    
    console.log('Token validation failed: no user data in response');
    return { isValid: false, user: null };
  } catch (error: any) {
    console.error('Token validation error:', error);
    
    // On any error, treat as invalid and clear token for auth errors
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      console.log('Authentication error, clearing token and returning invalid');
      removeAuthToken();
    }
    return { isValid: false, user: null };
  }
}

export function isTokenExpired(): boolean {
  // TODO: Implement JWT expiration check if token contains exp claim
  // For now, we don't have expiration info in the token storage
  return false;
} 

// Bank Account API functions
export const getBankList = async (): Promise<BankListResponse> => {
  const response = await fetch('https://api.vietqr.io/v2/banks');
  if (!response.ok) {
    throw new Error('Failed to fetch bank list');
  }
  return response.json();
};

export const getUserBankAccounts = async (): Promise<BankAccount[]> => {
  const token = getStoredToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch('/api/users/bank-accounts', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch bank accounts');
  }

  const data = await response.json();
  if (Array.isArray(data)) {
    return data as BankAccount[];
  }
  return (data.data as BankAccount[]) || (data.accounts as BankAccount[]) || [];
};

export const createBankAccount = async (bankAccountData: CreateBankAccountDto): Promise<BankAccount> => {
  const token = getStoredToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch('/api/users/bank-accounts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bankAccountData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create bank account');
  }

  const data = await response.json();
  return (data.data as BankAccount) || (data as BankAccount);
};

export const updateBankAccount = async (accountId: string, bankAccountData: UpdateBankAccountDto): Promise<BankAccount> => {
  const token = getStoredToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`/api/users/bank-accounts/${accountId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bankAccountData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update bank account');
  }

  const data = await response.json();
  return (data.data as BankAccount) || (data as BankAccount);
};

export const deleteBankAccount = async (accountId: string): Promise<void> => {
  const token = getStoredToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`/api/users/bank-accounts/${accountId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete bank account');
  }
};

export const setDefaultBankAccount = async (accountId: string): Promise<BankAccount> => {
  const token = getStoredToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`/api/users/bank-accounts/${accountId}/set-default`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to set default bank account');
  }

  const data = await response.json();
  return (data.data as BankAccount) || (data as BankAccount);
}; 