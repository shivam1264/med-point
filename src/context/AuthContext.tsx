import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from '../services/api';
import authService from '../services/authService';
import type { AuthRole, AuthUser, AuthAmbulance } from '../types';

interface AuthState {
  role: AuthRole | null;
  token: string | null;
  user: AuthUser | null;
  driver: AuthAmbulance | null;
  isLoggedIn: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  loginUser: (phone: string, password: string) => Promise<void>;
  loginAmbulance: (driverId: string, password: string) => Promise<void>;
  registerUser: (data: { name: string; phone: string; password: string; email?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = '@medflow_token';
const ROLE_KEY = '@medflow_role';
const USER_KEY = '@medflow_user';
const DRIVER_KEY = '@medflow_driver';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<AuthRole | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [driver, setDriver] = useState<AuthAmbulance | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on app boot
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const savedRole = await AsyncStorage.getItem(ROLE_KEY) as AuthRole | null;
        const savedUser = await AsyncStorage.getItem(USER_KEY);
        const savedDriver = await AsyncStorage.getItem(DRIVER_KEY);
        if (savedToken && savedRole) {
          setAuthToken(savedToken);
          setToken(savedToken);
          setRole(savedRole);
          if (savedRole === 'user' && savedUser) setUser(JSON.parse(savedUser));
          if (savedRole === 'ambulance' && savedDriver) setDriver(JSON.parse(savedDriver));
        }
      } catch (_) {}
      finally { setIsLoading(false); }
    };
    restoreSession();
  }, []);

  const loginUser = useCallback(async (phone: string, password: string) => {
    const res = await authService.loginUser(phone, password);
    await AsyncStorage.multiSet([
      [TOKEN_KEY, res.token],
      [ROLE_KEY, 'user'],
      [USER_KEY, JSON.stringify(res.user)]
    ]);
    setAuthToken(res.token);
    setToken(res.token);
    setRole('user');
    setUser(res.user);
  }, []);

  const loginAmbulance = useCallback(async (driverId: string, password: string) => {
    const res = await authService.loginAmbulance(driverId, password);
    await AsyncStorage.multiSet([
      [TOKEN_KEY, res.token],
      [ROLE_KEY, 'ambulance'],
      [DRIVER_KEY, JSON.stringify(res.driver)]
    ]);
    setAuthToken(res.token);
    setToken(res.token);
    setRole('ambulance');
    setDriver(res.driver);
  }, []);

  const registerUser = useCallback(async (data: { name: string; phone: string; password: string; email?: string }) => {
    const res = await authService.registerUser(data);
    await AsyncStorage.multiSet([
      [TOKEN_KEY, res.token],
      [ROLE_KEY, 'user'],
      [USER_KEY, JSON.stringify(res.user)]
    ]);
    setAuthToken(res.token);
    setToken(res.token);
    setRole('user');
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, ROLE_KEY, USER_KEY, DRIVER_KEY]);
    setAuthToken(null);
    setToken(null);
    setRole(null);
    setUser(null);
    setDriver(null);
    authService.logout();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      role, token, user, driver,
      isLoggedIn: !!token && !!role,
      isLoading,
      loginUser, loginAmbulance, registerUser, logout
    }),
    [role, token, user, driver, isLoading, loginUser, loginAmbulance, registerUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
