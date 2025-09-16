import { api } from '../api';

export interface AdminBankAccount {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  bankCode?: string;
  bankShortName?: string;
  bin?: string;
  logo?: string;
  isActive: boolean;
  isDefault: boolean;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBankAccountFilters {
  page?: number;
  limit?: number;
  search?: string;
  userId?: string;
  bankCode?: string;
  isActive?: boolean;
  isDefault?: boolean;
}

export interface CreateAdminBankAccountDto {
  userId: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  bankCode?: string;
  bankShortName?: string;
  bin?: string;
  logo?: string;
  isDefault?: boolean;
}

export interface UpdateAdminBankAccountDto {
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  bankCode?: string;
  bankShortName?: string;
  bin?: string;
  logo?: string;
  isActive?: boolean;
  isDefault?: boolean;
}

export interface AdminBankAccountStats {
  totalAccounts: number;
  activeAccounts: number;
  defaultAccounts: number;
  accountsByBank: Array<{
    bankName: string;
    count: number;
  }>;
  recentAccounts: AdminBankAccount[];
}

export const adminBankAccountApi = {
  // Get all bank accounts with filtering and pagination
  async getBankAccounts(filters: AdminBankAccountFilters = {}): Promise<{
    bankAccounts: AdminBankAccount[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const response = await api.get('/api/admin/bank-accounts', { params: filters });
    return response.data;
  },

  // Get bank account statistics
  async getBankAccountStats(): Promise<AdminBankAccountStats> {
    const response = await api.get('/api/admin/bank-accounts/stats');
    return response.data;
  },

  // Get bank account by ID
  async getBankAccountById(accountId: string): Promise<AdminBankAccount> {
    const response = await api.get(`/api/admin/bank-accounts/${accountId}`);
    return response.data;
  },

  // Create new bank account for a user
  async createBankAccount(data: CreateAdminBankAccountDto): Promise<AdminBankAccount> {
    const response = await api.post('/api/admin/bank-accounts', data);
    return response.data;
  },

  // Update bank account
  async updateBankAccount(accountId: string, data: UpdateAdminBankAccountDto): Promise<AdminBankAccount> {
    const response = await api.patch(`/api/admin/bank-accounts/${accountId}`, data);
    return response.data;
  },

  // Delete bank account
  async deleteBankAccount(accountId: string): Promise<void> {
    await api.delete(`/api/admin/bank-accounts/${accountId}`);
  },

  // Set default bank account
  async setDefaultBankAccount(accountId: string): Promise<AdminBankAccount> {
    const response = await api.patch(`/api/admin/bank-accounts/${accountId}/set-default`);
    return response.data;
  },

  // Get all users for selection
  async getUsers(): Promise<Array<{
    id: string;
    username: string;
    email: string;
    name: string;
    role: string;
  }>> {
    const response = await api.get('/api/admin/users');
    return response.data;
  },

  // Export bank accounts
  async exportBankAccounts(format: 'csv' | 'pdf' | 'excel', filters: AdminBankAccountFilters = {}): Promise<Blob> {
    const response = await api.get(`/api/admin/bank-accounts/export/${format}`, {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },
};

