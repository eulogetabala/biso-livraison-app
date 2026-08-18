import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { client, TOKEN_KEY, USER_KEY } from './apollo';
import type { MeQuery } from '../graphql/operations';

interface AuthContextValue {
  user: MeQuery['me'] | null;
  token: string | null;
  login: (token: string, user: MeQuery['me']) => void;
  logout: () => void;
  setUser: (user: MeQuery['me']) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): MeQuery['me'] | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as MeQuery['me']) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  );
  const [user, setUserState] = useState<MeQuery['me'] | null>(() =>
    readStoredUser(),
  );
  const navigate = useNavigate();

  const login = useCallback(
    (newToken: string, newUser: MeQuery['me']) => {
      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      setToken(newToken);
      setUserState(newUser);
    },
    [],
  );

  const setUser = useCallback((newUser: MeQuery['me']) => {
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setUserState(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUserState(null);
    client.clearStore();
    navigate('/login');
  }, [navigate]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      login,
      logout,
      setUser,
      isAuthenticated: Boolean(token && user),
    }),
    [user, token, login, logout, setUser],
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
