import { apiFetch } from '@/lib/api/client';
import type { Role, SessionResponse } from '@/lib/api/types';

export function fetchSession() {
  return apiFetch<SessionResponse>('/auth/session');
}

export function signIn(
  role: Role,
  options?: {
    stationId?: string | null;
    installationId?: string;
    pushToken?: string;
    pushPlatform?: 'ios' | 'android';
  },
) {
  return apiFetch<SessionResponse>('/auth/sign-in', {
    method: 'POST',
    body: JSON.stringify({
      role,
      station_id: options?.stationId ?? null,
      installation_id: options?.installationId ?? null,
      push_token: options?.pushToken ?? null,
      push_platform: options?.pushPlatform ?? null,
    }),
  });
}

export function signOut(installationId: string, pushToken?: string) {
  return apiFetch<{ signed_out: boolean }>('/auth/sign-out', {
    method: 'POST',
    body: JSON.stringify({
      installation_id: installationId,
      push_token: pushToken ?? null,
    }),
  });
}

export function registerPushToken(
  token: string,
  platform: string,
  installationId: string,
) {
  return apiFetch<{ registered: boolean }>('/auth/push-token', {
    method: 'POST',
    body: JSON.stringify({
      token,
      platform,
      installation_id: installationId,
    }),
  });
}

export function unregisterPushToken(installationId: string) {
  return apiFetch<{ unregistered: boolean }>('/auth/push-token', {
    method: 'DELETE',
    body: JSON.stringify({ installation_id: installationId }),
  });
}
