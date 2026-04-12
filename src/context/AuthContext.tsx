import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { AuthRole } from '../types';

interface AuthState {
  role: AuthRole | null;
  userId: string | null;
  isLoggedIn: boolean;
}

interface AuthContextValue extends AuthState {
  login: (role: AuthRole, userId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<AuthRole | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const login = useCallback((nextRole: AuthRole, nextUserId: string) => {
    setRole(nextRole);
    setUserId(nextUserId);
  }, []);

  const logout = useCallback(() => {
    setRole(null);
    setUserId(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      role,
      userId,
      isLoggedIn: role !== null && userId !== null,
      login,
      logout,
    }),
    [role, userId, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
