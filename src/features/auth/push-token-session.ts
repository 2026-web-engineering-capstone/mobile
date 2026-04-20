import AsyncStorage from '@react-native-async-storage/async-storage';

const PUSH_TOKEN_STORAGE_KEY = 'auth.current-push-token';
const PUSH_INSTALLATION_ID_STORAGE_KEY = 'auth.current-push-installation-id';

function createInstallationId() {
  return `install-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function setCurrentPushToken(token: string) {
  await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
}

export async function getCurrentPushToken() {
  return AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
}

export async function clearCurrentPushToken() {
  await AsyncStorage.removeItem(PUSH_TOKEN_STORAGE_KEY);
}

export async function getPushInstallationId() {
  const existingInstallationId = await AsyncStorage.getItem(
    PUSH_INSTALLATION_ID_STORAGE_KEY,
  );

  if (existingInstallationId) {
    return existingInstallationId;
  }

  const installationId = createInstallationId();
  await AsyncStorage.setItem(PUSH_INSTALLATION_ID_STORAGE_KEY, installationId);
  return installationId;
}
