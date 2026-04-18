import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import axios from 'axios';

export const API_BASE = 'https://med-point.onrender.com/api';

export const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

interface Admin {
  id: string; name: string; email: string;
  hospitalName: string; hospitalId: string; role: string;
}

interface AuthCtx {
  admin: Admin | null;
  token: string | null;
  login: (hospitalId: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('mf_token');
    const a = localStorage.getItem('mf_admin');
    if (t && a) { setToken(t); setAdmin(JSON.parse(a)); }
    setIsLoading(false);
  }, []);

  // login now takes hospitalId + password (not email)
  const login = async (hospitalId: string, password: string) => {
    const res = await api.post('/auth/hospital/login', { hospitalId, password });
    const { token: t, admin: a } = res.data;
    localStorage.setItem('mf_token', t);
    localStorage.setItem('mf_admin', JSON.stringify(a));
    setToken(t);
    setAdmin(a);
  };

  const logout = () => {
    localStorage.removeItem('mf_token');
    localStorage.removeItem('mf_admin');
    setToken(null);
    setAdmin(null);
  };

  const value = useMemo(() => ({ admin, token, login, logout, isLoading }), [admin, token, isLoading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
