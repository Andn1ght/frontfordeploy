// src/services/authService.ts
import { api } from '../config/axios';
import { User } from '../types/auth';
import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const authService = {
  currentUser: null as User | null,

  init() {
    // Load saved user and token on service initialization
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);

    if (savedToken && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        const decoded = jwtDecode<{ exp: number }>(savedToken);
        
        // Check if token is expired
        if (decoded.exp * 1000 > Date.now()) {
          this.currentUser = user;
          api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
          return user;
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        this.clearAuth();
      }
    }
    return null;
  },

  saveAuth(token: string, user: User) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    this.currentUser = user;
  },

  clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    delete api.defaults.headers.common['Authorization'];
    this.currentUser = null;
  },

  async login(email: string, password: string): Promise<User> {
    try {
      const response = await api.post<{ token: string; user: User }>('/auth/login', {
        email,
        password
      });
      const { token, user } = response.data;
      
      this.saveAuth(token, user);
      return user;
    } catch (error) {
      throw error;
    }
  },
  
  async register(username: string, email: string, password: string): Promise<User> {
    try {
      const response = await api.post<{ token: string; user: User }>('/auth/register', {
        username,
        email,
        password
      });
      const { token, user } = response.data;
      
      this.saveAuth(token, user);
      return user;
    } catch (error) {
      throw error;
    }
  },
  
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
    }
  },
  
  checkAuth(): User | null {
    const token = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);
    
    if (!token || !savedUser) {
      return null;
    }
    
    try {
      const user = JSON.parse(savedUser);
      const decoded = jwtDecode<{ exp: number }>(token);
      
      // Check if token is expired
      if (decoded.exp * 1000 < Date.now()) {
        this.clearAuth();
        return null;
      }
      
      this.currentUser = user;
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return user;
    } catch (error) {
      this.clearAuth();
      return null;
    }
  },

  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }
};

// Initialize auth service
authService.init();
