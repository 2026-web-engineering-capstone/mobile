import { apiFetch } from '@/lib/api/client';
import type { Role, SessionResponse } from '@/lib/api/types';

export function fetchSession() {
  return apiFetch<SessionResponse>('/auth/session');
}

export function signIn(role: Role) {
  return apiFetch<SessionResponse>('/auth/sign-in', {
    method: 'POST',
    body: JSON.stringify({ role }),
  });
}

export function signOut() {
  return apiFetch<{ signed_out: boolean }>('/auth/sign-out', {
    method: 'POST',
  });
}
