import { apiFetch } from '@/lib/api/client';
import type { SessionResponse, Role } from '@/features/auth/types';

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error: string | null;
};

export async function signInWithRole(role: Role) {
  const response = await apiFetch<ApiResponse<SessionResponse>>('/auth/sign-in', {
    method: 'POST',
    body: JSON.stringify({ role }),
  });
  return response.data.user;
}

export async function fetchCurrentSession() {
  const response = await apiFetch<ApiResponse<SessionResponse>>('/auth/session');
  return response.data.user;
}

export async function bootstrapDemoRealtime() {
  await apiFetch<ApiResponse<{ bootstrapped: boolean; request_id?: string }>>(
    '/auth/demo-bootstrap',
    {
      method: 'POST',
    },
  );
}

export async function signOutSession() {
  await apiFetch<ApiResponse<{ signed_out: boolean }>>('/auth/sign-out', {
    method: 'POST',
    body: JSON.stringify({ installation_id: 'demo-installation' }),
  });
}
