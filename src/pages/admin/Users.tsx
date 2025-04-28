import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  UserPlus, 
  Search, 
  Filter, 
  RefreshCw,
  Lock,
  Unlock,
  Edit,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { API_URL } from '../../config';
import Loading from '../../components/ui/Loading';
import Pagination from '../../components/ui/Pagination';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'admin' | 'department-officer';
  department?: string;
  active: boolean;
  suspended: boolean;
  createdAt: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [filter, setFilter] = useState({
    role: '',
    department: '',
    status: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'user',
    department: '',
  });

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...filter,
        search: searchTerm
      });
  
      const response = await axios.get(`${API_URL}/api/admin/users?${params}`);
  
      setUsers(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, filter, searchTerm]);

  const handleCreateUser = async () => {
    try {
      await axios.post(`${API_URL}/api/admin/users`, formData);
      toast.success('User created successfully');
      setShowCreateModal(false);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to create user');
    }
  };

  const handleEditUser = async () => {
    try {
      await axios.put(`${API_URL}/api/admin/users/${selectedUser?._id}`, formData);
      toast.success('User updated successfully');
      setShowCreateModal(false);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleSuspendUser = async (userId: string, reason: string) => {
    try {
      await axios.post(`${API_URL}/api/admin/users/${userId}/suspend`, { reason });
      toast.success('User suspended successfully');
      setShowSuspendModal(false);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to suspend user');
    }
  };

  const handleUnsuspendUser = async (userId : string) => {
    try {
      await axios.post(`${API_URL}/api/admin/users/${userId}/unsuspend`);
      toast.success('User unsuspended successfully');
      setShowSuspendModal(true);
      fetchUsers();
    } catch (error) {
      console.error('Error unsuspending user:', error);
    }
  };  

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            Manage system users and their permissions
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Create User
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={filter.role}
              onChange={(e) => setFilter({ ...filter, role: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="department">Department Officer</option>
            </select>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
            <button
              onClick={() => {
                setFilter({ role: '', department: '', status: '' });
                setSearchTerm('');
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <Loading />
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-700 font-medium">
                            {user.firstName[0]}
                            {user.lastName[0]}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800'
                        : user.role === 'department-officer'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.department || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.suspended
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.suspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowSuspendModal(true);
                        }}
                        className={`${
                          user.suspended
                            ? 'text-green-600 hover:text-green-900'
                            : 'text-red-600 hover:text-red-900'
                        }`}
                      >
                        {user.suspended ? (
                          <Unlock className="w-5 h-5" />
                        ) : (
                          <Lock className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setFormData({
                            firstName: user.firstName,
                            lastName: user.lastName,
                            email: user.email,
                            role: user.role,
                            department: user.department,
                          });
                          setShowCreateModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 shadow-lg w-96"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">Create/Edit User</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
              />
            </div>
            <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
            >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="department">Department Officer</option>
            </select>
            </div>

            {formData.role === 'department' && (
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <select
                id="department"
                value={formData.department || ''}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                >
                <option value="roads">Roads</option>
                <option value="water">Water</option>
                <option value="electricity">Electricity</option>
                <option value="sanitation">Sanitation</option>
                <option value="public-works">Public Works</option>
                <option value="other">Other</option>
                </select>
            </div>
            )}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={selectedUser ? handleEditUser : handleCreateUser}
                className="bg-blue-600 text-white px-6 py-2 rounded-md"
              >
                {selectedUser ? 'Update User' : 'Create User'}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Suspend Modal */}
        {showSuspendModal && (
        <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setShowSuspendModal(false)}
        >
            <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 shadow-lg w-96"
            onClick={(e) => e.stopPropagation()}
            >
            <h2 className="text-xl font-semibold mb-4">
                {selectedUser?.suspended ? 'Unsuspend User' : 'Suspend User'}
            </h2>
            <p className="mb-4">
                {selectedUser?.suspended
                ? 'Are you sure you want to unsuspend this user?'
                : 'Are you sure you want to suspend this user? Please provide a reason.'}
            </p>

            {!selectedUser?.suspended && (
                <textarea
                placeholder="Enter reason for suspension"
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                ></textarea>
            )}

            <div className="flex justify-end gap-4 mt-4">
                <button
                onClick={() => setShowSuspendModal(false)}
                className="text-gray-600"
                >
                Cancel
                </button>
                <button
                onClick={() => {
                    if (selectedUser) {
                    if (selectedUser.suspended) {
                        handleUnsuspendUser(selectedUser._id);
                    } else {
                        handleSuspendUser(selectedUser._id, 'Reason for suspension');
                    }
                    }
                }}
                className={`${
                    selectedUser?.suspended ? 'bg-green-600' : 'bg-red-600'
                } text-white px-6 py-2 rounded-md`}
                >
                {selectedUser?.suspended ? 'Unsuspend' : 'Suspend'}
                </button>
            </div>
            </div>
        </motion.div>
        )}

    </div>
  );
};

export default Users;
