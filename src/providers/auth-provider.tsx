import { Platform } from 'react-native';
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
import {
  clearCurrentPushToken,
  getCurrentPushToken,
  getPushInstallationId,
} from '@/features/auth/push-token-session';
import { clearStationPreferencesStorage } from '@/features/stations/store/use-station-preferences-store';
import { clearRequestDraftStorage } from '@/features/support-request/store/use-request-draft-store';
import { connectSupportRequestsWebSocket } from '@/features/support-request/realtime';
import { ApiError } from '@/lib/api/client';
import type { Role, SessionUser } from '@/lib/api/types';
import { queryKeys } from '@/lib/query/query-keys';

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  role: Role;
  user: SessionUser | null;
  signIn: (role: Role, options?: { stationId?: string | null }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const refreshSessionRequestIdRef = useRef(0);
  const supportRequestsConnectionRef = useRef<{ close: () => void } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<SessionUser | null>(null);

  const clearLocalSessionState = useCallback(async () => {
    await Promise.all([
      clearRequestDraftStorage(),
      clearStationPreferencesStorage(),
    ]);
  }, []);

  const clearSessionQueries = useCallback(async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
  }, [queryClient]);

  const closeRealtimeConnection = useCallback(() => {
    supportRequestsConnectionRef.current?.close();
    supportRequestsConnectionRef.current = null;
  }, []);

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
    } catch (error) {
      if (refreshSessionRequestIdRef.current !== requestId) {
        return;
      }

      if (error instanceof ApiError && error.status === 401) {
        await clearSessionQueries();
        await clearLocalSessionState();
        setUser(null);
      }
    } finally {
      if (refreshSessionRequestIdRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, [clearLocalSessionState, clearSessionQueries, queryClient]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    if (!user?.id) {
      closeRealtimeConnection();
      return;
    }

    const connection = connectSupportRequestsWebSocket(queryClient);
    supportRequestsConnectionRef.current = connection;

    return () => {
      if (supportRequestsConnectionRef.current === connection) {
        closeRealtimeConnection();
      }
    };
  }, [closeRealtimeConnection, queryClient, user?.id]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(user),
      isLoading,
      role: user?.role ?? 'passenger',
      user,
      signIn: async (role, options) => {
        refreshSessionRequestIdRef.current += 1;
        closeRealtimeConnection();
        const installationId = await getPushInstallationId();
        const pushToken = await getCurrentPushToken();
        const pushPlatform =
          pushToken && (Platform.OS === 'ios' || Platform.OS === 'android')
            ? Platform.OS
            : undefined;
        const session = await signInApi(role, {
          stationId: options?.stationId ?? null,
          installationId,
          pushToken: pushToken ?? undefined,
          pushPlatform,
        });
        await clearSessionQueries();
        await clearLocalSessionState();
        setUser(session.user);
        queryClient.setQueryData(queryKeys.auth.session, session);
      },
      signOut: async () => {
        refreshSessionRequestIdRef.current += 1;
        closeRealtimeConnection();
        const installationId = await getPushInstallationId();
        const pushToken = await getCurrentPushToken();
        await signOutApi(installationId, pushToken ?? undefined);
        await clearCurrentPushToken();
        await clearSessionQueries();
        await clearLocalSessionState();
        setUser(null);
      },
      refreshSession,
    }),
    [
      clearLocalSessionState,
      clearSessionQueries,
      closeRealtimeConnection,
      isLoading,
      queryClient,
      refreshSession,
      user,
    ],
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
