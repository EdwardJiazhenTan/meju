'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api';

interface User {
  user_id: number;
  email: string;
  username?: string;
  display_name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (userData: {
    email: string;
    password: string;
    username?: string;
    displayName?: string;
  }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = ApiClient.getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await ApiClient.getCurrentUser();
      if (response.success && response.data?.user) {
        setUser(response.data.user);
      } else {
        ApiClient.clearToken();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      ApiClient.clearToken();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await ApiClient.login(email, password);
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        return { success: true, message: 'Login successful' };
      } else {
        return { success: false, message: response.message || 'Login failed' };
      }
    } catch {
      return { success: false, message: 'Network error occurred' };
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    username?: string;
    displayName?: string;
  }) => {
    try {
      const response = await ApiClient.register(userData);
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        return { success: true, message: 'Registration successful' };
      } else {
        return { success: false, message: response.message || 'Registration failed' };
      }
    } catch {
      return { success: false, message: 'Network error occurred' };
    }
  };

  const logout = () => {
    ApiClient.clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}