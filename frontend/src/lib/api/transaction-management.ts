import { TransactionFilterDto, DisputeHandlingDto, ManualAdjustmentDto, TransactionActionDto } from '@/types/transaction-management';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class TransactionManagementAPI {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('authToken');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Get transactions with filtering and pagination
  static async getTransactions(filters: TransactionFilterDto) {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    return this.request(`/admin/transactions?${queryParams.toString()}`);
  }

  // Get transaction by ID
  static async getTransactionById(transactionId: string) {
    return this.request(`/admin/transactions/${transactionId}`);
  }

  // Get transaction statistics
  static async getTransactionStats() {
    return this.request('/admin/transactions/stats');
  }

  // Handle dispute
  static async handleDispute(disputeData: DisputeHandlingDto) {
    return this.request('/admin/transactions/dispute/handle', {
      method: 'POST',
      body: JSON.stringify(disputeData),
    });
  }

  // Make manual adjustment
  static async makeManualAdjustment(adjustmentData: ManualAdjustmentDto) {
    return this.request('/admin/transactions/adjustment', {
      method: 'POST',
      body: JSON.stringify(adjustmentData),
    });
  }

  // Perform transaction action
  static async performTransactionAction(actionData: TransactionActionDto) {
    return this.request('/admin/transactions/action', {
      method: 'POST',
      body: JSON.stringify(actionData),
    });
  }

  // Bulk action on multiple transactions
  static async bulkAction(transactionIds: string[], action: string, reason?: string) {
    return this.request('/admin/transactions/bulk-action', {
      method: 'POST',
      body: JSON.stringify({ transactionIds, action, reason }),
    });
  }

  // Export transactions
  static async exportTransactions(format: 'csv' | 'pdf' | 'excel', filters?: TransactionFilterDto) {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }

    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/admin/transactions/export/${format}?${queryParams.toString()}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.status} ${response.statusText}`);
    }

    return response.blob();
  }

  // Mark transaction as disputed
  static async markTransactionAsDisputed(transactionId: string, reason: string, adminNotes?: string) {
    return this.request(`/admin/transactions/dispute/${transactionId}/mark`, {
      method: 'POST',
      body: JSON.stringify({ reason, adminNotes }),
    });
  }

  // Mark dispute as under investigation
  static async investigateDispute(transactionId: string, adminNotes?: string) {
    return this.request(`/admin/transactions/dispute/${transactionId}/investigate`, {
      method: 'POST',
      body: JSON.stringify({ adminNotes }),
    });
  }

  // Get pending disputes
  static async getPendingDisputes(filters?: TransactionFilterDto) {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }

    return this.request(`/admin/transactions/disputes/pending?${queryParams.toString()}`);
  }

  // Get disputes under investigation
  static async getDisputesUnderInvestigation(filters?: TransactionFilterDto) {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }

    return this.request(`/admin/transactions/disputes/under-investigation?${queryParams.toString()}`);
  }
} 