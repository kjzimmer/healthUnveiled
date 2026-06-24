import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { setAccessToken as setToken, clearAccessToken } from '../lib/apiFetch';

interface AuthContextValue {
  accessToken: string | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Attempt to restore session via refresh token cookie on mount
  useEffect(() => {
    fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
      .then(res => res.ok ? res.json() as Promise<{ accessToken: string }> : null)
      .then(data => { if (data?.accessToken) { setToken(data.accessToken); setAccessToken(data.accessToken); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback((token: string) => {
    setToken(token);
    setAccessToken(token);
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } catch { /* ignore */ }
    clearAccessToken();
    setAccessToken(null);
  }, [accessToken]);

  return (
    <AuthContext.Provider value={{ accessToken, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
