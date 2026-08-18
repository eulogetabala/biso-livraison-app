import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  clearStoredToken,
  clearStoredUser,
  getStoredToken,
  getStoredUser,
  storeToken,
  storeUser,
} from './token-storage';
import type { UserModel } from '../graphql/types';

type AuthUser = UserModel & {
  __typename?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  initializing: boolean;
  setTokenAndUser: (token: string, user: AuthUser) => Promise<void>;
  setUser: (user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [token, storedUser] = await Promise.all([getStoredToken(), getStoredUser()]);
        if (mounted) setUserState(token && storedUser ? (storedUser as AuthUser) : null);
      } finally {
        if (mounted) setInitializing(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const setTokenAndUser = useCallback(async (token: string, nextUser: AuthUser) => {
    await Promise.all([storeToken(token), storeUser(nextUser)]);
    setUserState(nextUser);
  }, []);

  const setUser = useCallback(async (nextUser: AuthUser) => {
    await storeUser(nextUser);
    setUserState(nextUser);
  }, []);

  const logout = useCallback(async () => {
    await Promise.all([clearStoredToken(), clearStoredUser()]);
    setUserState(null);
  }, []);

  const value = useMemo(
    () => ({ user, initializing, setTokenAndUser, setUser, logout }),
    [user, initializing, setTokenAndUser, setUser, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
