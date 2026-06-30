"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Account } from "@/lib/account-types";
import { ApiClientError, fetchMe, signOut as apiSignOut } from "@/lib/api-client";

interface AuthContextValue {
  ready: boolean;
  isSignedIn: boolean;
  account: Account | null;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const me = await fetchMe();
      setAccount(me);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        setAccount(null);
      }
    }
  }, []);

  useEffect(() => {
    void refresh().finally(() => setReady(true));
  }, [refresh]);

  const signOut = useCallback(async () => {
    try {
      await apiSignOut();
    } catch (error) {
      if (!(error instanceof ApiClientError && error.status === 401)) {
        throw error;
      }
    } finally {
      setAccount(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      ready,
      isSignedIn: account !== null,
      account,
      refresh,
      signOut,
    }),
    [ready, account, refresh, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
