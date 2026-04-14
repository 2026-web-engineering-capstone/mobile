import Constants from 'expo-constants';
import { Platform } from 'react-native';
import type { ApiEnvelope } from '@/lib/api/types';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const API_PORT = '8000';

function normalizeLocalhostForAndroid(hostname: string) {
  if (Platform.OS === 'android' && ['localhost', '127.0.0.1'].includes(hostname)) {
    return '10.0.2.2';
  }

  return hostname;
}

function resolveExpoDevHost() {
  const hostUri = Constants.expoConfig?.hostUri;

  if (!hostUri) {
    return null;
  }

  try {
    const hostname = new URL(`http://${hostUri}`).hostname;

    return normalizeLocalhostForAndroid(hostname);
  } catch {
    return null;
  }
}

function resolveApiBaseUrl() {
  const configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/$/, '');
  }

  const expoDevHost = resolveExpoDevHost();

  if (expoDevHost) {
    return `http://${expoDevHost}:${API_PORT}`;
  }

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${API_PORT}`;
  }

  return `http://localhost:${API_PORT}`;
}

const API_BASE_URL = resolveApiBaseUrl();

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const requestUrl = `${API_BASE_URL}${path}`;
  const response = await fetch(requestUrl, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    let message: string | undefined;

    try {
      const payload = JSON.parse(text) as { error?: unknown; detail?: unknown };

      if (typeof payload.error === 'string') {
        message = payload.error;
      } else if (typeof payload.detail === 'string') {
        message = payload.detail;
      } else if (Array.isArray(payload.detail)) {
        message = payload.detail
          .map((item) => {
            if (typeof item === 'string') {
              return item;
            }

            if (item && typeof item === 'object') {
              const itemRecord = item as { loc?: unknown; msg?: unknown };
              const location = Array.isArray(itemRecord.loc)
                ? itemRecord.loc.map((part) => String(part)).join('.')
                : undefined;
              const detailMessage =
                typeof itemRecord.msg === 'string'
                  ? itemRecord.msg
                  : JSON.stringify(itemRecord);

              return location ? `${location}: ${detailMessage}` : detailMessage;
            }

            return String(item);
          })
          .join(', ');
      } else if (payload.detail != null) {
        message = JSON.stringify(payload.detail);
      }
    } catch {
      message = undefined;
    }

    throw new ApiError(
      `${init?.method ?? 'GET'} ${path} failed (${response.status}): ${message ?? (text || response.statusText)}`,
      response.status,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json()) as ApiEnvelope<T>;

  if (!payload.success) {
    throw new Error(payload.error ?? 'Request failed');
  }

  return payload.data;
}
