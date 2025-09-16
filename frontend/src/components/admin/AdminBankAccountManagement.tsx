'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  BankAccount, 
  CreateBankAccountDto, 
  UpdateBankAccountDto, 
  BankInfo 
} from '@/types';
import { 
  getBankList, 
  getUserBankAccounts, 
  createBankAccount, 
  updateBankAccount, 
  deleteBankAccount, 
  setDefaultBankAccount 
} from '@/lib/api';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  StarIcon,
  BuildingLibraryIcon,
  MagnifyingGlassIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface AdminBankAccountManagementProps {
  // No props needed as this is for admin management
}

export function AdminBankAccountManagement({}: AdminBankAccountManagementProps) {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [banks, setBanks] = useState<BankInfo[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<CreateBankAccountDto & { userId: string }>({
    userId: '',
    bankName: '',
    accountName: '',
    accountNumber: '',
    bankCode: '',
    bankShortName: '',
    bin: '',
    logo: '',
    isDefault: false,
  });

  const buildBankFallbackLogoUrl = (name?: string, shortName?: string): string => {
    const displayName = (shortName || name || 'Bank').trim();
    const encoded = encodeURIComponent(displayName);
    return `https://ui-avatars.com/api/?name=${encoded}&background=random&color=fff&size=64&format=png`;
  };

  const getBankLogoUrl = (params: { bankCode?: string; bankShortName?: string; bankName?: string }): string => {
    const code = (params.bankCode || '').trim().toUpperCase();
    const short = (params.bankShortName || '').trim().toUpperCase();
    const matched = banks.find(b => b.code?.toUpperCase() === code || b.shortName?.toUpperCase() === short);
    if (matched?.logo) {
      return matched.logo;
    }
    return buildBankFallbackLogoUrl(params.bankName, params.bankShortName);
  };

  useEffect(() => {
    loadBankAccounts();
    loadBanks();
    loadUsers();
  }, []);

  const loadBankAccounts = async () => {
    try {
      setIsLoading(true);
      // For admin, we'll load all bank accounts
      // This would need a new admin endpoint
      const accounts = await getUserBankAccounts();
      setBankAccounts(accounts);
    } catch (error) {
      console.error('Failed to load bank accounts:', error);
      setError('Failed to load bank accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const loadBanks = async () => {
    try {
      setIsLoadingBanks(true);
      const bankList = await getBankList();
      setBanks(bankList.data);
    } catch (error) {
      console.error('Failed to load banks:', error);
      setError('Failed to load bank list');
    } finally {
      setIsLoadingBanks(false);
    }
  };

  const loadUsers = async () => {
    try {
      // This would need a new admin endpoint to get all users
      // For now, we'll use mock data
      setUsers([
        { id: '1', username: 'admin', email: 'admin@example.com', name: 'Admin User' },
        { id: '2', username: 'streamer1', email: 'streamer1@example.com', name: 'Streamer One' },
        { id: '3', username: 'streamer2', email: 'streamer2@example.com', name: 'Streamer Two' },
      ]);
    } catch (error) {
      console.error('Failed to load users:', error);
      setError('Failed to load users');
    }
  };

  const handleInputChange = (field: keyof (CreateBankAccountDto & { userId: string }), value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBankSelect = (bankCode: string) => {
    const selectedBank = banks.find(bank => bank.code === bankCode);
    if (selectedBank) {
      setFormData(prev => ({
        ...prev,
        bankCode: selectedBank.code,
        bankName: selectedBank.name,
        bankShortName: selectedBank.shortName,
        bin: selectedBank.bin,
        logo: selectedBank.logo,
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      bankName: '',
      accountName: '',
      accountNumber: '',
      bankCode: '',
      bankShortName: '',
      isDefault: false,
    });
    setEditingAccountId(null);
    setIsAddingAccount(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (editingAccountId) {
        // Update existing account
        const updateData: UpdateBankAccountDto = {
          bankName: formData.bankName,
          accountName: formData.accountName,
          accountNumber: formData.accountNumber,
          bankCode: formData.bankCode,
          bankShortName: formData.bankShortName,
        };
        
        await updateBankAccount(editingAccountId, updateData);
        setSuccessMessage('Bank account updated successfully!');
      } else {
        // Create new account
        await createBankAccount(formData);
        setSuccessMessage('Bank account added successfully!');
      }
      
      resetForm();
      loadBankAccounts();
    } catch (error) {
      console.error('Failed to save bank account:', error);
      setError(error instanceof Error ? error.message : 'Failed to save bank account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (account: BankAccount) => {
    setFormData({
      userId: account.userId,
      bankName: account.bankName,
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      bankCode: account.bankCode || '',
      bankShortName: account.bankShortName || '',
      bin: account.bin || '',
      logo: account.logo || '',
      isDefault: account.isDefault,
    });
    setEditingAccountId(account._id);
    setIsAddingAccount(true);
  };

  const handleDelete = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this bank account?')) {
      return;
    }

    try {
      setIsLoading(true);
      await deleteBankAccount(accountId);
      setSuccessMessage('Bank account deleted successfully!');
      loadBankAccounts();
    } catch (error) {
      console.error('Failed to delete bank account:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete bank account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async (accountId: string) => {
    try {
      setIsLoading(true);
      await setDefaultBankAccount(accountId);
      setSuccessMessage('Default bank account updated successfully!');
      loadBankAccounts();
    } catch (error) {
      console.error('Failed to set default bank account:', error);
      setError(error instanceof Error ? error.message : 'Failed to set default bank account');
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  useEffect(() => {
    const timer = setTimeout(clearMessages, 5000);
    return () => clearTimeout(timer);
  }, [error, successMessage]);

  const filteredBankAccounts = bankAccounts.filter(account => {
    const user = users.find(u => u.id === account.userId);
    const matchesSearch = searchTerm === '' || 
      account.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.accountNumber.includes(searchTerm) ||
      (user && user.username.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  return (
    <Card className="bg-white shadow-sm border">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
          <BuildingLibraryIcon className="h-5 w-5 mr-2 text-indigo-600" />
          Bank Account Management
        </CardTitle>
        <CardDescription>
          Manage bank accounts for all users in the system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search bank accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
          <Button
            onClick={() => setIsAddingAccount(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Bank Account
          </Button>
        </div>

        {/* Add/Edit Bank Account Form */}
        {isAddingAccount && (
          <Card className="bg-gray-50 border-dashed">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-gray-900">
                {editingAccountId ? 'Edit Bank Account' : 'Add New Bank Account'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="userId" className="text-sm font-medium text-gray-700">
                      User *
                    </Label>
                    <Select
                      value={formData.userId}
                      onValueChange={(value) => handleInputChange('userId', value)}
                    >
                      <SelectTrigger className="bg-white border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center space-x-2">
                              <UserIcon className="h-4 w-4 text-gray-400" />
                              <span>{user.name} ({user.username})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankCode" className="text-sm font-medium text-gray-700">
                      Bank *
                    </Label>
                    <Select
                      value={formData.bankCode}
                      onValueChange={handleBankSelect}
                      disabled={isLoadingBanks}
                    >
                      <SelectTrigger className="bg-white border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                        <SelectValue placeholder="Select a bank" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {banks.map((bank) => (
                          <SelectItem key={bank.code} value={bank.code}>
                            <div className="flex items-center space-x-2">
                              <img
                                src={bank.logo || buildBankFallbackLogoUrl(bank.name, bank.shortName)}
                                alt={bank.name}
                                className="w-6 h-6 object-contain rounded"
                                onError={(e) => {
                                  const target = e.currentTarget as HTMLImageElement;
                                  const currentSrc = target.getAttribute('src') || '';
                                  const fallback = buildBankFallbackLogoUrl(bank.name, bank.shortName);
                                  if (currentSrc !== fallback) {
                                    target.src = fallback;
                                    return;
                                  }
                                  target.style.display = 'none';
                                }}
                              />
                              <span>{bank.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountName" className="text-sm font-medium text-gray-700">
                      Account Holder Name *
                    </Label>
                    <Input
                      id="accountName"
                      value={formData.accountName}
                      onChange={(e) => handleInputChange('accountName', e.target.value)}
                      placeholder="Enter account holder name"
                      className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountNumber" className="text-sm font-medium text-gray-700">
                      Account Number *
                    </Label>
                    <Input
                      id="accountNumber"
                      value={formData.accountNumber}
                      onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                      placeholder="Enter account number"
                      className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isDefault"
                    checked={formData.isDefault}
                    onCheckedChange={(checked) => handleInputChange('isDefault', checked)}
                  />
                  <Label htmlFor="isDefault" className="text-sm font-medium text-gray-700">
                    Set as default account
                  </Label>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    disabled={isLoading}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {isLoading ? 'Saving...' : (editingAccountId ? 'Update Account' : 'Add Account')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Bank Accounts List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Bank Accounts ({filteredBankAccounts.length})
            </h3>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading bank accounts...</p>
            </div>
          ) : filteredBankAccounts.length === 0 ? (
            <div className="text-center py-8">
              <BuildingLibraryIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bank accounts found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'No bank accounts match your search criteria.' : 'No bank accounts have been added yet.'}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => setIsAddingAccount(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Bank Account
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBankAccounts.map((account) => {
                const user = users.find(u => u.id === account.userId);
                return (
                  <Card key={account._id} className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <img
                              src={getBankLogoUrl({ bankCode: account.bankCode, bankShortName: account.bankShortName, bankName: account.bankName })}
                              alt={account.bankShortName || account.bankName}
                              className="w-6 h-6 object-contain rounded"
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                const fallback = buildBankFallbackLogoUrl(account.bankName, account.bankShortName);
                                if (target.src !== fallback) {
                                  target.src = fallback;
                                  return;
                                }
                                target.style.display = 'none';
                              }}
                            />
                            <h4 className="font-medium text-gray-900">{account.bankName}</h4>
                            {account.isDefault && (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                <StarIcon className="h-3 w-3 mr-1" />
                                Default
                              </Badge>
                            )}
                            {!account.isActive && (
                              <Badge variant="secondary" className="bg-red-100 text-red-800">
                                Inactive
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><span className="font-medium">User:</span> {user?.name || 'Unknown'} ({user?.username || 'N/A'})</p>
                            <p><span className="font-medium">Account Holder:</span> {account.accountName}</p>
                            <p><span className="font-medium">Account Number:</span> {account.accountNumber}</p>
                            {account.bankCode && (
                              <p><span className="font-medium">Bank Code:</span> {account.bankCode}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!account.isDefault && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetDefault(account._id)}
                              disabled={isLoading}
                              className="border-gray-300 text-gray-700 hover:bg-gray-50"
                              title="Set as default"
                            >
                              <StarIcon className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(account)}
                            disabled={isLoading}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            title="Edit account"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(account._id)}
                            disabled={isLoading}
                            className="border-red-300 text-red-700 hover:bg-red-50"
                            title="Delete account"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

