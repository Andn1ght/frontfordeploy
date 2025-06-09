import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ShieldAlert, Loader } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface LoginModalProps {
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      onClose();
    } catch (err) {
      // Error is handled by useAuth hook
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-dark-700 rounded-lg shadow-xl w-full max-w-md overflow-hidden"
      >
        <div className="flex items-center justify-between bg-primary-500 text-white p-4">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="h-6 w-6" />
            <h2 className="text-xl font-semibold">Secure Login</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Log in to access advanced features and save your analysis history.
          </p>
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border dark:border-dark-500 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-dark-800"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border dark:border-dark-500 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-dark-800"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-500 text-white py-2 rounded-md hover:bg-primary-600 transition-colors disabled:opacity-70 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Log In'
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};