import { PropsWithChildren, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useQueryClient } from '@tanstack/react-query';
import { registerPushToken, unregisterPushToken } from '@/features/auth/api/auth';
import { BRAND_TOKENS } from '@/lib/design-tokens';
import {
  clearCurrentPushToken,
  getCurrentPushToken,
  getPushInstallationId,
  setCurrentPushToken,
} from '@/features/auth/push-token-session';
import {
  getFirebaseFcmToken,
  isFirebaseMessagingAvailable,
  requestFirebaseMessagingPermission,
  subscribeFirebaseTokenRefresh,
  subscribeForegroundFirebaseMessages,
} from '@/lib/notifications/firebase';
import { queryKeys } from '@/lib/query/query-keys';
import { useAuth } from '@/providers/auth-provider';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function getRequestIdFromData(data: unknown) {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const requestId = (data as { requestId?: unknown }).requestId;
  return typeof requestId === 'string' ? requestId : null;
}

function getMobilePlatform() {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return Platform.OS;
  }

  return null;
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('support-request-updates', {
      name: '지원 요청 알림',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: BRAND_TOKENS.brand,
    });
  }

  if (!Device.isDevice) {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

  if (!projectId) {
    return null;
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return token.data;
  } catch {
    return null;
  }
}

async function syncPushToken(nextToken?: string) {
  const platform = getMobilePlatform();
  if (!platform) return;

  // 우선 Firebase FCM 토큰을 시도 — 자격증명/네이티브 모듈이 갖춰진 경우.
  // 부재 시 Expo Push 토큰으로 자동 폴백.
  let token = nextToken ?? null;
  if (!token && isFirebaseMessagingAvailable()) {
    const granted = await requestFirebaseMessagingPermission();
    if (granted) {
      token = await getFirebaseFcmToken();
    }
  }
  if (!token) {
    token = await registerForPushNotificationsAsync();
  }
  if (!token) return;

  const installationId = await getPushInstallationId();
  await registerPushToken(token, platform, installationId);
  await setCurrentPushToken(token);
}

export async function unregisterCurrentPushToken() {
  const token = await getCurrentPushToken();

  if (!token) {
    return;
  }

  const installationId = await getPushInstallationId();
  await unregisterPushToken(installationId);
  await clearCurrentPushToken();
}

export function NotificationsProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      return;
    }

    void syncPushToken().catch(() => undefined);

    const pushTokenSubscription = Notifications.addPushTokenListener((token) => {
      void syncPushToken(token.data).catch(() => undefined);
    });

    const notificationReceivedSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        const requestId = getRequestIdFromData(notification.request.content.data);
        void queryClient.invalidateQueries({
          queryKey: queryKeys.supportRequests.all,
        });
        if (!requestId) {
          return;
        }
        void queryClient.invalidateQueries({
          queryKey: queryKeys.supportRequests.detail(requestId),
        });
      });

    const notificationResponseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const requestId = getRequestIdFromData(
          response.notification.request.content.data,
        );
        void queryClient.invalidateQueries({
          queryKey: queryKeys.supportRequests.all,
        });
        if (!requestId) {
          return;
        }
        void queryClient.invalidateQueries({
          queryKey: queryKeys.supportRequests.detail(requestId),
        });
      });

    // Firebase 메시지/토큰 리스너 (자격증명/네이티브 모듈이 있을 때만 동작).
    const firebaseForegroundUnsub = subscribeForegroundFirebaseMessages(
      ({ requestId }) => {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.supportRequests.all,
        });
        if (requestId) {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.supportRequests.detail(requestId),
          });
        }
      },
    );
    const firebaseTokenRefreshUnsub = subscribeFirebaseTokenRefresh((token) => {
      void syncPushToken(token).catch(() => undefined);
    });

    return () => {
      pushTokenSubscription.remove();
      notificationReceivedSubscription.remove();
      notificationResponseSubscription.remove();
      firebaseForegroundUnsub();
      firebaseTokenRefreshUnsub();
    };
  }, [isAuthenticated, queryClient, user?.id]);

  return children;
}
