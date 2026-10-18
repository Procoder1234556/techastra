import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, type User } from '../lib/api';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
  loginAs: (email: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get<{ authenticated: boolean; user: User | null }>(
        '/auth/status',
      );
      setUser(data.authenticated ? data.user : null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const loginAs = (email: string) => {
    const redirect = encodeURIComponent(window.location.href);
    const code = import.meta.env.VITE_DEMO_ACCESS_CODE;
    const codeParam = code ? `&code=${encodeURIComponent(code)}` : '';
    window.location.href = `/auth/google?email=${encodeURIComponent(email)}&redirect=${redirect}${codeParam}`;
  };

  const logout = () => {
    window.location.href = '/auth/logout';
  };

  const value = useMemo(
    () => ({ user, loading, refresh, loginAs, logout }),
    [user, loading, refresh, loginAs, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
