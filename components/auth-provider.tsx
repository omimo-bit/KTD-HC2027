'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthSession, SessionUser } from '@/lib/types';
import { login as loginRequest, apiPost } from '@/lib/api';

type AuthContextValue = {
  token: string;
  user: SessionUser | null;
  ready: boolean;
  signIn: (username: string, pin: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = 'kd-homecoming-2027-session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setSession(JSON.parse(raw) as AuthSession);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setReady(true);
    }
  }, []);

  const signIn = useCallback(async (username: string, pin: string) => {
    const result = await loginRequest(username, pin);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    setSession(result);
  }, []);

  const signOut = useCallback(() => {
    if (session?.token) void apiPost('logout', session.token).catch(() => undefined);
    window.localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, [session?.token]);

  const value = useMemo<AuthContextValue>(() => ({ token: session?.token || '', user: session?.user || null, ready, signIn, signOut }), [session, ready, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
