import { api } from '../api';

export interface Deposit {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'processing' | 'disputed';
  paymentMethod: 'stripe' | 'paypal' | 'bank_transfer' | 'wallet' | 'crypto';
  description: string;
  createdAt: string;
  completedAt?: string;
  processingFee: number;
  netAmount: number;
  adminNotes?: string;
  disputeReason?: string;
  disputeStatus?: 'open' | 'under_investigation' | 'resolved' | 'closed';
  disputeResolution?: 'refund' | 'approve' | 'partial_refund' | 'investigation';
  manualAdjustment?: number;
  adjustmentReason?: string;
  transactionId?: string;
  paymentIntentId?: string;
  bankAccount?: {
    last4: string;
    bankName: string;
    accountType: string;
  };
  verificationStatus: 'verified' | 'pending' | 'failed' | 'not_required';
  kycStatus: 'approved' | 'pending' | 'rejected' | 'not_required';
}

export interface DepositStats {
  totalDeposits: number;
  totalAmount: number;
  pendingDeposits: number;
  completedDeposits: number;
  failedDeposits: number;
  disputedDeposits: number;
  averageDepositAmount: number;
  depositsToday: number;
  depositsThisWeek: number;
  depositsThisMonth: number;
}

export interface DepositFilters {
  page?: number;
  limit?: number;
  status?: string;
  paymentMethod?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface DepositResponse {
  deposits: Deposit[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface StatusUpdateData {
  status: string;
  adminNotes?: string;
}

export interface DisputeResolutionData {
  action: 'approve' | 'refund' | 'partial_refund' | 'investigation';
  adminNotes?: string;
  refundAmount?: number;
}

export interface AdjustmentData {
  adjustmentAmount: number;
  reason: string;
  adminNotes?: string;
}

export const depositManagementApi = {
  // Get all deposits with filtering and pagination
  async getDeposits(filters: DepositFilters = {}): Promise<DepositResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
    if (filters.search) params.append('search', filters.search);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);

    const response = await api.get(`/admin/deposits?${params.toString()}`);
    return response.data;
  },

  // Get deposit statistics
  async getDepositStats(period: string = 'month'): Promise<DepositStats> {
    const response = await api.get(`/admin/deposits/stats?period=${period}`);
    return response.data;
  },

  // Get deposit by ID
  async getDepositById(depositId: string): Promise<Deposit> {
    const response = await api.get(`/admin/deposits/${depositId}`);
    return response.data;
  },

  // Update deposit status
  async updateDepositStatus(depositId: string, data: StatusUpdateData): Promise<any> {
    const response = await api.put(`/admin/deposits/${depositId}/status`, data);
    return response.data;
  },

  // Handle deposit dispute
  async handleDepositDispute(depositId: string, data: DisputeResolutionData): Promise<any> {
    const response = await api.post(`/admin/deposits/${depositId}/dispute`, data);
    return response.data;
  },

  // Apply manual adjustment
  async applyDepositAdjustment(depositId: string, data: AdjustmentData): Promise<any> {
    const response = await api.post(`/admin/deposits/${depositId}/adjustment`, data);
    return response.data;
  },

  // Export deposits data
  async exportDeposits(format: 'csv' | 'pdf' | 'excel', filters: DepositFilters = {}): Promise<Blob> {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
    if (filters.search) params.append('search', filters.search);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);

    const response = await api.get(`/admin/export/deposits/${format}?${params.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
