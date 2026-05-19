import Constants from 'expo-constants';
import { Platform } from 'react-native';

function getDevelopmentHost() {
  const hostCandidates = [
    Constants.expoConfig?.hostUri,
    Constants.expoGoConfig?.debuggerHost,
    Constants.linkingUri,
  ];

  for (const candidate of hostCandidates) {
    if (!candidate) {
      continue;
    }

    try {
      const normalizedCandidate = candidate.includes('://')
        ? candidate
        : `http://${candidate}`;
      const { hostname } = new URL(normalizedCandidate);
      if (!hostname) {
        continue;
      }

      if (
        Platform.OS === 'android' &&
        (hostname === 'localhost' || hostname === '127.0.0.1')
      ) {
        return '10.0.2.2';
      }

      return hostname;
    } catch {
      continue;
    }
  }

  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
}

export function getApiBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }

  return `http://${getDevelopmentHost()}:8000`;
}

export function getWebSocketBaseUrl() {
  const apiBaseUrl = getApiBaseUrl();

  if (apiBaseUrl.startsWith('https://')) {
    return apiBaseUrl.replace('https://', 'wss://');
  }
  if (apiBaseUrl.startsWith('http://')) {
    return apiBaseUrl.replace('http://', 'ws://');
  }
  return apiBaseUrl;
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
