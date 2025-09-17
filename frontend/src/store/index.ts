import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { apiClient, setAuthToken, removeAuthToken, validateAuthToken, isTokenExpired } from '@/lib/api';
import { User, Wallet, Donation, DonationLink, OBSSettings, Transaction } from '@/types';

// Main application store
interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  
  // Wallet state
  wallet: Wallet | null;
  transactions: Transaction[];
  
  // Donation state
  donations: Donation[];
  donationLinks: DonationLink[];
  recentDonations: Donation[];
  
  // OBS state
  obsSettings: OBSSettings | null;
  
  // Dashboard state
  dashboardStats: any | null; // Changed from DashboardStats to any as it's not in types
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (status: boolean) => void;
  initializeAuth: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUserRole: (role: string) => void;
  setWallet: (wallet: Wallet | null) => void;
  updateWalletBalance: (amount: number) => void;
  addTransaction: (transaction: Transaction) => void;
  setTransactions: (transactions: Transaction[]) => void;
  addDonation: (donation: Donation) => void;
  setDonations: (donations: Donation[]) => void;
  addDonationLink: (link: DonationLink) => void;
  updateDonationLink: (linkId: string, updates: Partial<DonationLink>) => void;
  removeDonationLink: (linkId: string) => void;
  setDonationLinks: (links: DonationLink[] | null | undefined) => void;
  setOBSSettings: (settings: OBSSettings | null) => void;
  updateOBSSettings: (updates: Partial<OBSSettings>) => void;
  setDashboardStats: (stats: any | null) => void; // Changed from DashboardStats to any
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  user: null,
  isAuthenticated: false,
  wallet: null,
  transactions: [],
  donations: [],
  donationLinks: [],
  recentDonations: [],
  obsSettings: null,
  dashboardStats: null,
  isLoading: false,
  error: null,
};

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        
        setAuthenticated: (status) => set({ isAuthenticated: status }),
        
        refreshUser: async () => {
          try {
            const { isValid, user } = await validateAuthToken();
            if (isValid && user) {
              set({ user, isAuthenticated: true });
            }
          } catch (error) {
            console.error('Failed to refresh user data:', error);
          }
        },
        
        updateUserRole: (role: string) => {
          const { user } = get();
          if (user) {
            set({ user: { ...user, role: role as 'streamer' | 'admin' | 'donor' } });
          }
        },
        
        initializeAuth: async () => {
          try {
            console.log('Initializing authentication...');
            
            // Check if token is expired first
            if (isTokenExpired()) {
              console.log('Token is expired, clearing auth state');
              removeAuthToken();
              set({ user: null, isAuthenticated: false });
              return;
            }
            
            const { isValid, user } = await validateAuthToken();
            console.log('Token validation result:', { isValid, user: user ? 'exists' : 'null' });
            
            if (isValid && user) {
              console.log('Setting authenticated user:', user.name);
              set({ user, isAuthenticated: true });
            } else {
              console.log('Token invalid, clearing auth state');
              // Token is invalid, clear it
              removeAuthToken();
              set({ user: null, isAuthenticated: false });
            }
          } catch (error: any) {
            console.error('Authentication initialization error:', error);
            
            // Only clear auth state for actual authentication errors, not network issues
            if (error?.response?.status === 401 || error?.response?.status === 403) {
              console.log('Authentication error, clearing auth state');
              removeAuthToken();
              set({ user: null, isAuthenticated: false });
            } else {
              console.log('Network or other error, maintaining current auth state');
              // For network errors, don't clear the auth state immediately
              // Let the user try to use the app and see if it works
            }
          }
        },
        
        setWallet: (wallet) => set({ wallet }),
        
        updateWalletBalance: (amount) => {
          const { wallet } = get();
          if (wallet) {
            set({ wallet: { ...wallet, balance: wallet.balance + amount } });
          }
        },
        
        addTransaction: (transaction) => {
          const { transactions } = get();
          set({ transactions: [transaction, ...transactions] });
        },
        
        setTransactions: (transactions) => set({ transactions }),
        
        addDonation: (donation) => {
          const { donations, recentDonations } = get();
          const newDonations = [donation, ...donations];
          const newRecentDonations = [donation, ...recentDonations.slice(0, 9)];
          
          set({
            donations: newDonations,
            recentDonations: newRecentDonations,
          });
        },
        
        setDonations: (donations) => set({ donations }),
        
        addDonationLink: (link) => {
          const { donationLinks } = get();
          set({ donationLinks: [link, ...(donationLinks || [])] });
        },
        
        updateDonationLink: (linkId, updates) => {
          const { donationLinks } = get();
          const updatedLinks = (donationLinks || []).map(link =>
            link.id === linkId ? { ...link, ...updates } : link
          );
          set({ donationLinks: updatedLinks });
        },
        
        removeDonationLink: (linkId) => {
          const { donationLinks } = get();
          const filteredLinks = (donationLinks || []).filter(link => link.id !== linkId);
          set({ donationLinks: filteredLinks });
        },
        
        setDonationLinks: (links) => set({ donationLinks: links || [] }),
        
        setOBSSettings: (settings) => set({ obsSettings: settings }),
        
        updateOBSSettings: (updates) => {
          const { obsSettings } = get();
          if (obsSettings) {
            set({ obsSettings: { ...obsSettings, ...updates } });
          }
        },
        
        setDashboardStats: (stats) => set({ dashboardStats: stats }),
        
        setLoading: (loading) => set({ isLoading: loading }),
        
        setError: (error) => set({ error }),
        
        clearError: () => set({ error: null }),
        
        reset: () => set(initialState),
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          wallet: state.wallet,
          transactions: state.transactions,
          donations: state.donations,
          donationLinks: state.donationLinks,
          obsSettings: state.obsSettings,
        }),
      }
    )
  )
);

// Authentication store
interface AuthStore {
  isAuthenticating: boolean;
  authError: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        isAuthenticating: false,
        authError: null,
        
        login: async (email, password) => {
          set({ isAuthenticating: true, authError: null });
          try {
            const response = await apiClient.auth.login(email, password);
            
            // Backend returns data directly
            if (response && response.access_token && response.user) {
              // Store the token
              setAuthToken(response.access_token);
              
              // Set user in app store
              useAppStore.getState().setUser(response.user);
              useAppStore.getState().setAuthenticated(true);
            } else {
              throw new Error('Invalid response format');
            }
          } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Login failed';
            set({ authError: errorMessage });
            throw new Error(errorMessage);
          } finally {
            set({ isAuthenticating: false });
          }
        },
        
        register: async (userData) => {
          set({ isAuthenticating: true, authError: null });
          try {
            // Transform frontend data to match backend expectations
            const nameParts = userData.name.trim().split(' ');
            let firstName = nameParts[0] || '';
            let lastName = nameParts.slice(1).join(' ') || '';
            
            // If only one name is provided, use it as firstName and set a default lastName
            if (firstName && !lastName) {
              lastName = 'User';
            }
            
            // Ensure both names meet minimum length requirements
            if (firstName.length < 2) {
              throw new Error('First name must be at least 2 characters long');
            }
            if (lastName.length < 2) {
              throw new Error('Last name must be at least 2 characters long');
            }
            
            // Prepare data for backend API (username will be generated on backend)
            const backendData = {
              email: userData.email,
              password: userData.password,
              firstName,
              lastName,
              role: userData.role,
            };
            
            const response = await apiClient.auth.register(
              backendData.email, 
              backendData.password, 
              backendData.firstName,
              backendData.lastName,
              backendData.role
            );
            
            // Backend now returns access_token and user data for automatic login
            if (response && response.access_token && response.user) {
              // Store the token
              setAuthToken(response.access_token);
              
              // Set user in app store
              useAppStore.getState().setUser(response.user);
              useAppStore.getState().setAuthenticated(true);
            } else {
              throw new Error('Registration failed');
            }
          } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
            set({ authError: errorMessage });
            throw new Error(errorMessage);
          } finally {
            set({ isAuthenticating: false });
          }
        },
        
        logout: () => {
          // Call logout API
          apiClient.auth.logout().catch(console.error);
          
          // Remove token and reset state
          removeAuthToken();
          useAppStore.getState().reset();
          set({ isAuthenticating: false, authError: null });
        },
        
        forgotPassword: async (email) => {
          set({ isAuthenticating: true, authError: null });
          try {
            // TODO: Implement forgot password API call
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to send reset email';
            set({ authError: errorMessage });
            throw new Error(errorMessage);
          } finally {
            set({ isAuthenticating: false });
          }
        },
        
        resetPassword: async (token, password) => {
          set({ isAuthenticating: true, authError: null });
          try {
            // TODO: Implement reset password API call
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to reset password';
            set({ authError: errorMessage });
            throw new Error(errorMessage);
          } finally {
            set({ isAuthenticating: false });
          }
        },
        
        verifyEmail: async (token) => {
          set({ isAuthenticating: true, authError: null });
          try {
            // TODO: Implement email verification API call
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to verify email';
            set({ authError: errorMessage });
            throw new Error(errorMessage);
          } finally {
            set({ isAuthenticating: false });
          }
        },
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          isAuthenticating: state.isAuthenticating,
          authError: state.authError,
        }),
      }
    )
  )
);

// UI store
interface UIStore {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: Date;
  }>;
  
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addNotification: (notification: Omit<UIStore['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set) => ({
        sidebarOpen: false,
        theme: 'light',
        notifications: [],
        
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        
        setTheme: (theme) => set({ theme }),
        
        addNotification: (notification) => set((state) => ({
          notifications: [
            {
              ...notification,
              id: Date.now().toString(),
              timestamp: new Date(),
            },
            ...state.notifications,
          ],
        })),
        
        removeNotification: (id) => set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
        
        clearNotifications: () => set({ notifications: [] }),
      }),
      {
        name: 'ui-store',
        partialize: (state) => ({
          theme: state.theme,
        }),
      }
    )
  )
); 