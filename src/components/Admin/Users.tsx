import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Trash2, Edit, X, Check, Plus } from 'lucide-react';
import { api } from '../../config/axios';
import { User } from '../../types/auth';
import { toast } from 'react-hot-toast';

interface EditableUser extends User {
  isEditing?: boolean;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<EditableUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user' as 'admin' | 'user'
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data.map((user: User) => ({ ...user, isEditing: false })));
    } catch (error) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (userId: string) => {
    setUsers(users.map(user => ({
      ...user,
      isEditing: user.id === userId ? true : false
    })));
  };

  const handleCancelEdit = (userId: string) => {
    setUsers(users.map(user => ({
      ...user,
      isEditing: false
    })));
  };

  const handleUpdate = async (user: EditableUser) => {
    try {
      const response = await api.put(`/users/${user.id}`, {
        username: user.username,
        email: user.email,
        role: user.role
      });
      
      setUsers(users.map(u => 
        u.id === user.id ? { ...response.data, isEditing: false } : u
      ));
      
      toast.success('User updated successfully');
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(user => user.id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await api.post('/auth/register', newUser);
      setUsers([...users, { ...response.data.user, isEditing: false }]);
      setShowAddForm(false);
      setNewUser({ username: '', email: '', password: '', role: 'user' });
      toast.success('User added successfully');
    } catch (error) {
      toast.error('Failed to add user');
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading...' : 'Load Users'}
        </button>

        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add User
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 bg-white dark:bg-dark-700 rounded-lg shadow p-4">
          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                type="text"
                value={newUser.username}
                onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-dark-800 dark:border-dark-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={newUser.email}
                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-dark-800 dark:border-dark-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={newUser.password}
                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-dark-800 dark:border-dark-600"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                value={newUser.role}
                onChange={e => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'user' })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-dark-800 dark:border-dark-600"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Add User
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-dark-700 rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50 dark:bg-dark-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-dark-600">
            {users.map((user) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-gray-50 dark:hover:bg-dark-600"
              >
                <td className="px-6 py-4 text-sm">
                  {user.isEditing ? (
                    <input
                      type="text"
                      value={user.username}
                      onChange={e => setUsers(users.map(u => 
                        u.id === user.id ? { ...u, username: e.target.value } : u
                      ))}
                      className="w-full px-2 py-1 border rounded dark:bg-dark-800 dark:border-dark-600"
                    />
                  ) : (
                    user.username
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                  {user.isEditing ? (
                    <input
                      type="email"
                      value={user.email}
                      onChange={e => setUsers(users.map(u => 
                        u.id === user.id ? { ...u, email: e.target.value } : u
                      ))}
                      className="w-full px-2 py-1 border rounded dark:bg-dark-800 dark:border-dark-600"
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td className="px-6 py-4">
                  {user.isEditing ? (
                    <select
                      value={user.role}
                      onChange={e => setUsers(users.map(u => 
                        u.id === user.id ? { ...u, role: e.target.value as 'admin' | 'user' } : u
                      ))}
                      className="px-2 py-1 border rounded dark:bg-dark-800 dark:border-dark-600"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {user.role}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    {user.isEditing ? (
                      <>
                        <button
                          onClick={() => handleUpdate(user)}
                          className="text-green-600 hover:text-green-700"
                          title="Save"
                        >
                          <Check className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleCancelEdit(user.id)}
                          className="text-gray-600 hover:text-gray-700"
                          title="Cancel"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(user.id)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Edit"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;