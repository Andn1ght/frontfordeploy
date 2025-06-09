import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, FileVideo, Activity, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import AuditLogs from '../components/Admin/AuditLogs';
import UserManagement from '../components/Admin/Users';
import Videos from '../components/Admin/Videos';

const Admin: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'users' | 'videos' | 'logs'>('users');

  useEffect(() => {
    // Redirect non-admin users
    if (!isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, navigate]);

  const tabs = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'videos', label: 'Videos', icon: FileVideo },
    { id: 'logs', label: 'Audit Logs', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-800">
      <div className="bg-white dark:bg-dark-700 shadow-md px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Shield className="h-8 w-8 text-primary-500" />
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage users, videos, and system logs
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white dark:bg-dark-700 rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200 dark:border-dark-600">
            <nav className="flex space-x-4 px-4">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as typeof activeTab)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === id
                      ? 'border-primary-500 text-primary-500'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'videos' && <Videos />}
            {activeTab === 'logs' && <AuditLogs />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;