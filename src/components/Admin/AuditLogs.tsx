import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Search, Filter } from 'lucide-react';
import { apiService } from '../../services/apiService';
import type { AuditLog } from '../../types/auth';

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await apiService.getAuditLogs();
        setLogs(data);
      } catch (err) {
        setError('Failed to fetch audit logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterAction === 'all' || log.action === filterAction;
    return matchesSearch && matchesFilter;
  });

  const uniqueActions = Array.from(new Set(logs.map(log => log.action)));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Audit Logs</h2>
        
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border dark:border-dark-500 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          
          <div className="w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border dark:border-dark-500 rounded-lg focus:ring-2 focus:ring-primary-500 appearance-none"
              >
                <option value="all">All Actions</option>
                {uniqueActions.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredLogs.map((log, index) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white dark:bg-dark-700 rounded-lg shadow p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{log.userName}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{log.action}</p>
              </div>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Clock className="h-4 w-4 mr-1" />
                {new Date(log.timestamp).toLocaleString()}
              </div>
            </div>
            <p className="mt-2 text-sm">{log.details}</p>
          </motion.div>
        ))}

        {filteredLogs.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No audit logs found
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;