import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { fetchSession, signIn as signInApi, signOut as signOutApi } from '@/features/auth/api/auth';
import { ApiError } from '@/lib/api/client';
import type { Role, SessionUser } from '@/lib/api/types';
import { queryKeys } from '@/lib/query/query-keys';

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  role: Role;
  user: SessionUser | null;
  signIn: (role: Role) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const refreshSessionRequestIdRef = useRef(0);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<SessionUser | null>(null);

  const clearSessionQueries = useCallback(async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
  }, [queryClient]);

  const refreshSession = useCallback(async () => {
    const requestId = refreshSessionRequestIdRef.current + 1;
    refreshSessionRequestIdRef.current = requestId;

    try {
      const session = await fetchSession();

      if (refreshSessionRequestIdRef.current !== requestId) {
        return;
      }

      setUser(session.user);
      queryClient.setQueryData(queryKeys.auth.session, session);
    } catch {
      if (refreshSessionRequestIdRef.current !== requestId) {
        return;
      }

      await clearSessionQueries();
      setUser(null);
    } finally {
      if (refreshSessionRequestIdRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, [clearSessionQueries, queryClient]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(user),
      isLoading,
      role: user?.role ?? 'passenger',
      user,
      signIn: async (role) => {
        refreshSessionRequestIdRef.current += 1;
        await clearSessionQueries();
        const session = await signInApi(role);
        setUser(session.user);
        queryClient.setQueryData(queryKeys.auth.session, session);
      },
      signOut: async () => {
        refreshSessionRequestIdRef.current += 1;
        try {
          await signOutApi();
        } finally {
          await clearSessionQueries();
          setUser(null);
        }
      },
      refreshSession,
    }),
    [clearSessionQueries, isLoading, queryClient, refreshSession, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return value;
}
