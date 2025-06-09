import React, { useState } from 'react';
import { Shield, Moon, Sun, LogIn, LogOut, User, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  onLoginClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAdmin, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const goToAdmin = () => {
    navigate('/admin');
    setUserMenuOpen(false);
  };

  return (
    <header className="bg-white dark:bg-dark-700 shadow-md px-4 py-3 flex items-center justify-between">
      <button 
        onClick={handleLogoClick}
        className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
      >
        <Shield className="h-8 w-8 text-primary-500" />
        <h1 className="text-xl font-bold">SecureVision</h1>
      </button>
      
      <div className="flex items-center space-x-4">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>
        
        {user ? (
          <div className="relative">
            <button 
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
            >
              <User className="h-5 w-5" />
              <span className="text-sm font-medium">{user.username}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                isAdmin 
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              }`}>
                {isAdmin ? 'Admin' : 'User'}
              </span>
            </button>
            
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-700 rounded-md shadow-lg py-1 z-10">
                {isAdmin && (
                  <button 
                    onClick={goToAdmin}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-600"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    <span>Admin Panel</span>
                  </button>
                )}
                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-600"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={onLoginClick}
            className="flex items-center space-x-2 px-4 py-2 rounded-md bg-primary-500 text-white hover:bg-primary-600 transition-colors"
          >
            <LogIn className="h-4 w-4" />
            <span>Log in</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;