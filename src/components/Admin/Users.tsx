import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Trash2, Edit, X, Check, Plus } from 'lucide-react';
import { api } from '../../config/axios';
import { User } from '../../types/auth';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface EditableUser extends User {
  isEditing?: boolean;
}

const Users: React.FC = () => {
  const { t } = useTranslation();
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
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (userId: string) => {
    setUsers(users.map(user => ({
      ...user,
      isEditing: user.id === userId
    })));
  };

  const handleCancelEdit = () => {
    setUsers(users.map(user => ({ ...user, isEditing: false })));
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

      toast.success(t('user_updated'));
    } catch {
      toast.error(t('user_update_failed'));
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm(t('confirm_delete_user'))) return;

    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(user => user.id !== userId));
      toast.success(t('user_deleted'));
    } catch {
      toast.error(t('user_delete_failed'));
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await api.post('/auth/register', newUser);
      setUsers([...users, { ...response.data.user, isEditing: false }]);
      setShowAddForm(false);
      setNewUser({ username: '', email: '', password: '', role: 'user' });
      toast.success(t('user_added'));
    } catch {
      toast.error(t('user_add_failed'));
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
          {loading ? t('loading') : t('load_users')}
        </button>

        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <Plus className="h-5 w-5" />
          {t('add_user')}
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 bg-white dark:bg-dark-700 rounded-lg shadow p-4">
          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('username')}</label>
              <input
                type="text"
                value={newUser.username}
                onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-dark-800 dark:border-dark-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('email')}</label>
              <input
                type="email"
                value={newUser.email}
                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-dark-800 dark:border-dark-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('password')}</label>
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
              <label className="block text-sm font-medium mb-1">{t('role')}</label>
              <select
                value={newUser.role}
                onChange={e => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'user' })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-dark-800 dark:border-dark-600"
              >
                <option value="user">{t('user')}</option>
                <option value="admin">{t('admin')}</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                {t('add_user')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-dark-700 rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50 dark:bg-dark-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('username')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('email')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('role')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('actions')}</th>
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
                  ) : user.username}
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
                  ) : user.email}
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
                      <option value="user">{t('user')}</option>
                      <option value="admin">{t('admin')}</option>
                    </select>
                  ) : (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {t(user.role)}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    {user.isEditing ? (
                      <>
                        <button onClick={() => handleUpdate(user)} className="text-green-600 hover:text-green-700" title={t('save')}>
                          <Check className="h-5 w-5" />
                        </button>
                        <button onClick={handleCancelEdit} className="text-gray-600 hover:text-gray-700" title={t('cancel')}>
                          <X className="h-5 w-5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(user.id)} className="text-blue-600 hover:text-blue-700" title={t('edit')}>
                          <Edit className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-700" title={t('delete')}>
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
