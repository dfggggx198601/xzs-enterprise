import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, userApi, apiClient } from '../api';

interface User {
  id: number;
  userName: string;
  realName: string;
  age: number;
  sex: number;
  birthDay: string;
  phone: string;
  role: number;
  status: number;
  imagePath: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (userName: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isLoggedIn: false,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await userApi.getCurrentUser();
      if (res.code === 1 && res.response) {
        setUser(res.response);
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      const cookie = await AsyncStorage.getItem('session_cookie');
      if (cookie) {
        try {
          await refreshUser();
        } catch {
          await apiClient.clearSession();
        }
      }
      setIsLoading(false);
    };
    checkSession();
  }, [refreshUser]);

  const login = useCallback(async (userName: string, password: string) => {
    const res = await authApi.login({ userName, password, remember: false });
    if (res.code === 1) {
      await refreshUser();
    } else {
      throw new Error(res.message || '登录失败');
    }
  }, [refreshUser]);

  const logout = useCallback(async () => {
    await apiClient.clearSession();
    setUser(null);
    try {
      await authApi.logout();
    } catch {
      // best-effort server logout
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
