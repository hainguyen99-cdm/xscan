'use client';

import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { apiClient } from '@/lib/api';
import { User } from '@/types';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface ExtendedUser extends User {
  totalDonations?: number;
  totalRevenue?: number;
  _id?: string;
  firstName?: string;
  avatar?: string;
  lastName?: string;
  profilePicture?: string;
  coverPhoto?: string;
  isActive?: boolean;
  twoFactorEnabled: boolean;
  profileVisibility?: string;
  showEmail?: boolean;
  showPhone?: boolean;
  showAddress?: boolean;
  showLastLogin?: boolean;
  profileCompletionPercentage?: number;
  verificationBadges?: string[];
  profileViews?: number;
  profileViewers?: string[];
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
  profileCompletedAt?: string | null;
  lastProfileUpdate?: string;
  bankToken?: string;
}

interface EditUserForm {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: string;
  isActive: boolean;
  twoFactorEnabled: boolean;
  profileVisibility: string;
  showEmail: boolean;
  showPhone: boolean;
  showAddress: boolean;
  showLastLogin: boolean;
  bankToken: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ExtendedUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUser, setEditingUser] = useState<ExtendedUser | null>(null);
  const [editForm, setEditForm] = useState<EditUserForm>({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    role: '',
    isActive: true,
    twoFactorEnabled: false,
    profileVisibility: 'public',
    showEmail: true,
    showPhone: false,
    showAddress: false,
    showLastLogin: false,
    bankToken: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const mappedStatus = statusFilter === 'all' ? undefined : (statusFilter === 'active' ? 'active' : 'inactive');
      const mappedRole = roleFilter === 'all' ? undefined : roleFilter;
      const params: any = {
        page: 1,
        limit: 100,
        searchTerm: searchTerm || undefined,
        role: mappedRole,
        status: mappedStatus,
      };
      const response = await apiClient.admin.users.list(params);
      const items = Array.isArray(response) ? response : (response.items || response.data || []);
      const transformedUsers: ExtendedUser[] = (items as any[]).map((user: any) => ({
        id: user._id || user.id,
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email,
        username: user.username,
        role: user.role,
        avatar: user.profilePicture || user.avatar,
        isEmailVerified: typeof user.isEmailVerified === 'boolean' ? user.isEmailVerified : true,
        twoFactorEnabled: Boolean(user.twoFactorEnabled),
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        status: user.isActive ? 'active' : 'suspended',
        totalDonations: user.totalDonations || 0,
        totalRevenue: user.totalRevenue || 0,
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        coverPhoto: user.coverPhoto,
        isActive: user.isActive,
        profileVisibility: user.profileVisibility,
        showEmail: user.showEmail,
        showPhone: user.showPhone,
        showAddress: user.showAddress,
        showLastLogin: user.showLastLogin,
        profileCompletionPercentage: user.profileCompletionPercentage,
        verificationBadges: user.verificationBadges,
        profileViews: user.profileViews,
        profileViewers: user.profileViewers,
        updatedAt: user.updatedAt,
        profileCompletedAt: user.profileCompletedAt,
        lastProfileUpdate: user.lastProfileUpdate,
        bankToken: user.bankToken,
      }));
      setUsers(transformedUsers);
      setFilteredUsers(transformedUsers);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter, statusFilter]);

  const handleUserAction = async (userId: string, action: string) => {
    try {
      setIsLoadingAction(true);
      setError(null);

      switch (action) {
        case 'activate':
          await apiClient.admin.users.updateStatus(userId, 'active');
          break;
        case 'deactivate':
          await apiClient.admin.users.updateStatus(userId, 'inactive');
          break;
        case 'delete':
          if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            await apiClient.admin.users.delete(userId);
          } else {
            return;
          }
          break;
        case 'edit':
          const userToEdit = users.find(user => user.id === userId);
          if (userToEdit) {
            setEditingUser(userToEdit);
            try {
              // Try to fetch the latest user details from admin API (will include bankToken if present)
              const latest = await apiClient.admin.users.get(userToEdit.id);
              const details = latest?.items ? latest.items : latest; // support either shape
              const merged = { ...userToEdit, ...(details?.user || details) } as ExtendedUser;
              setEditForm({
                firstName: merged.firstName || '',
                lastName: merged.lastName || '',
                email: merged.email || '',
                username: merged.username || '',
                role: merged.role || '',
                isActive: merged.isActive || true,
                twoFactorEnabled: merged.twoFactorEnabled || false,
                profileVisibility: merged.profileVisibility || 'public',
                showEmail: merged.showEmail || true,
                showPhone: merged.showPhone || false,
                showAddress: merged.showAddress || false,
                showLastLogin: merged.showLastLogin || false,
                bankToken: merged.bankToken || ''
              });
            } catch (_) {
              // Fallback to existing list data
              setEditForm({
                firstName: userToEdit.firstName || '',
                lastName: userToEdit.lastName || '',
                email: userToEdit.email || '',
                username: userToEdit.username || '',
                role: userToEdit.role || '',
                isActive: userToEdit.isActive || true,
                twoFactorEnabled: userToEdit.twoFactorEnabled || false,
                profileVisibility: userToEdit.profileVisibility || 'public',
                showEmail: userToEdit.showEmail || true,
                showPhone: userToEdit.showPhone || false,
                showAddress: userToEdit.showAddress || false,
                showLastLogin: userToEdit.showLastLogin || false,
                bankToken: userToEdit.bankToken || ''
              });
            }
            setShowEditUser(true);
          }
          return;
        default:
          console.log(`Action ${action} for user ${userId}`);
          return;
      }

      // Refresh the users list
      await fetchUsers();
      
      // Close user details modal if it's open
      if (showUserDetails) {
        setShowUserDetails(false);
        setSelectedUser(null);
      }
    } catch (err: any) {
      console.error(`Error performing ${action} on user:`, err);
      setError(err.response?.data?.message || `Failed to ${action} user`);
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleEditUser = async () => {
    if (!editingUser) return;

    try {
      setIsLoadingAction(true);
      setError(null);

      // Persist via admin API
      await apiClient.admin.users.update(editingUser.id, {
        username: editForm.username,
        email: editForm.email,
        role: editForm.role,
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        twoFactorEnabled: editForm.twoFactorEnabled,
        profileVisibility: editForm.profileVisibility,
        showEmail: editForm.showEmail,
        showPhone: editForm.showPhone,
        showAddress: editForm.showAddress,
        showLastLogin: editForm.showLastLogin,
        bankToken: editForm.bankToken,
      });

      // Update status separately if changed
      const desiredStatus = editForm.isActive ? 'active' : 'suspended';
      if (editingUser.status !== desiredStatus) {
        await apiClient.admin.users.updateStatus(editingUser.id, desiredStatus);
      }

      // Refresh list
      await fetchUsers();

      // Close edit modal
      setShowEditUser(false);
      setEditingUser(null);
      setEditForm({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        role: '',
        isActive: true,
        twoFactorEnabled: false,
        profileVisibility: 'public',
        showEmail: true,
        showPhone: false,
        showAddress: false,
        showLastLogin: false,
        bankToken: ''
      });

      // Show success message
      setError(null);
    } catch (err: any) {
      console.error('Error updating user:', err);
      setError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleCancelEdit = () => {
    setShowEditUser(false);
    setEditingUser(null);
    setEditForm({
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      role: '',
      isActive: true,
      twoFactorEnabled: false,
      profileVisibility: 'public',
      showEmail: true,
      showPhone: false,
      showAddress: false,
      showLastLogin: false,
      bankToken: ''
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="h-3 w-3 mr-1" />
            Active
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="h-3 w-3 mr-1" />
            Suspended
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      streamer: 'bg-blue-100 text-blue-800',
      donor: 'bg-green-100 text-green-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[role as keyof typeof colors]}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  const getActionButton = (user: ExtendedUser) => {
    if (user.status === 'active') {
      return (
        <button
          onClick={() => handleUserAction(user.id, 'deactivate')}
          className="text-yellow-600 hover:text-yellow-900"
          title="Deactivate User"
          disabled={isLoadingAction}
        >
          <XCircleIcon className="h-4 w-4" />
        </button>
      );
    } else {
      return (
        <button
          onClick={() => handleUserAction(user.id, 'activate')}
          className="text-green-600 hover:text-green-900"
          title="Activate User"
          disabled={isLoadingAction}
        >
          <CheckCircleIcon className="h-4 w-4" />
        </button>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-600">Manage users, accounts, and permissions</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button 
              onClick={fetchUsers}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add User
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <XCircleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name, email, or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="streamer">Streamer</option>
              <option value="donor">Donor</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Users ({filteredUsers.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verification
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {user.avatar ? (
                          <img className="h-10 w-10 rounded-full" src={user.avatar} alt={user.name} />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-indigo-600">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-sm text-gray-500">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {user.isEmailVerified ? (
                        <CheckCircleIcon className="h-4 w-4 text-green-500" title="Email Verified" />
                      ) : (
                        <XCircleIcon className="h-4 w-4 text-red-500" title="Email Not Verified" />
                      )}
                      {user.twoFactorEnabled ? (
                        <CheckCircleIcon className="h-4 w-4 text-green-500" title="2FA Enabled" />
                      ) : (
                        <XCircleIcon className="h-4 w-4 text-gray-400" title="2FA Disabled" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserDetails(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleUserAction(user.id, 'edit')}
                        className="text-gray-600 hover:text-gray-900"
                        title="Edit User"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      {getActionButton(user)}
                      <button
                        onClick={() => handleUserAction(user.id, 'delete')}
                        className="text-red-600 hover:text-red-900"
                        title="Delete User"
                        disabled={isLoadingAction}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No users found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">User Details</h3>
                <button
                  onClick={() => setShowUserDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedUser.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <p className="mt-1 text-sm text-gray-900">@{selectedUser.username}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <div className="mt-1">{getRoleBadge(selectedUser.role)}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedUser.status)}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Profile Completion</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedUser.profileCompletionPercentage}%</p>
                </div>
                
                {selectedUser.totalDonations !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Donations</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.totalDonations}</p>
                  </div>
                )}
                
                {selectedUser.totalRevenue !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Revenue</label>
                    <p className="mt-1 text-sm text-gray-900">₫{selectedUser.totalRevenue.toLocaleString()}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Member Since</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
                
                {selectedUser.lastLoginAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Login</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedUser.lastLoginAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => handleUserAction(selectedUser.id, 'edit')}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
                >
                  Edit User
                </button>
                <button
                  onClick={() => setShowUserDetails(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUser && editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Edit User: {editingUser.name}</h3>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900 border-b pb-2">Basic Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="First Name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Last Name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Email"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Username"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="admin">Admin</option>
                      <option value="streamer">Streamer</option>
                      <option value="donor">Donor</option>
                    </select>
                  </div>
                </div>
                
                {/* Account Settings */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900 border-b pb-2">Account Settings</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Account Active</label>
                      <p className="text-xs text-gray-500">Enable or disable user account</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.isActive}
                        onChange={(e) => setEditForm({...editForm, isActive: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Two-Factor Authentication</label>
                      <p className="text-xs text-gray-500">Enable 2FA for enhanced security</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.twoFactorEnabled}
                        onChange={(e) => setEditForm({...editForm, twoFactorEnabled: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Visibility</label>
                    <select
                      value={editForm.profileVisibility}
                      onChange={(e) => setEditForm({...editForm, profileVisibility: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                      <option value="friends">Friends Only</option>
                    </select>
                  </div>
                  
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium text-gray-700">Privacy Settings</h5>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Show Email</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.showEmail}
                          onChange={(e) => setEditForm({...editForm, showEmail: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Show Phone</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.showPhone}
                          onChange={(e) => setEditForm({...editForm, showPhone: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Show Address</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.showAddress}
                          onChange={(e) => setEditForm({...editForm, showAddress: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Show Last Login</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.showLastLogin}
                          onChange={(e) => setEditForm({...editForm, showLastLogin: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Token Banking Information</h5>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Token</label>
                    <input
                      type="text"
                      value={editForm.bankToken}
                      onChange={(e) => setEditForm({ ...editForm, bankToken: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter bank token for this user"
                    />
                    <p className="mt-1 text-xs text-gray-500">This token is used for banking integrations on behalf of the user.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex space-x-3 justify-end">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditUser}
                  disabled={isLoadingAction}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isLoadingAction ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 