/**
 * Firebase Cloud Messaging 토큰 획득 래퍼.
 *
 * `@react-native-firebase/messaging`이 설치되지 않았거나 자격증명 파일
 * (google-services.json / GoogleService-Info.plist)이 없으면 graceful no-op로 폴백한다.
 * 폴백 시 기존 expo-notifications 토큰을 사용한다.
 *
 * 사용자가 Firebase 자격증명을 추가하고 `yarn prebuild:clean && yarn ios/android`로
 * 네이티브 모듈을 재생성하면 자동으로 활성화된다.
 */

let cachedAvailable: boolean | null = null;

type Messaging = {
  requestPermission: () => Promise<number>;
  getToken: () => Promise<string>;
  onMessage: (handler: (payload: unknown) => void) => () => void;
  onTokenRefresh: (handler: (token: string) => void) => () => void;
  AuthorizationStatus: { AUTHORIZED: number; PROVISIONAL: number };
};

function tryLoadMessaging(): Messaging | null {
  if (cachedAvailable === false) return null;
  try {
    // @ts-expect-error 동적 require — 패키지가 설치되어 있지 않을 수 있음.
    const mod = require('@react-native-firebase/messaging');
    cachedAvailable = true;
    return (mod.default ?? mod)();
  } catch {
    cachedAvailable = false;
    return null;
  }
}

export function isFirebaseMessagingAvailable(): boolean {
  if (cachedAvailable !== null) return cachedAvailable;
  return tryLoadMessaging() !== null;
}

export async function requestFirebaseMessagingPermission(): Promise<boolean> {
  const messaging = tryLoadMessaging();
  if (!messaging) return false;
  try {
    const status = await messaging.requestPermission();
    return (
      status === messaging.AuthorizationStatus.AUTHORIZED ||
      status === messaging.AuthorizationStatus.PROVISIONAL
    );
  } catch {
    return false;
  }
}

export async function getFirebaseFcmToken(): Promise<string | null> {
  const messaging = tryLoadMessaging();
  if (!messaging) return null;
  try {
    return await messaging.getToken();
  } catch {
    return null;
  }
}

export function subscribeForegroundFirebaseMessages(
  handler: (payload: { requestId: string | null }) => void,
): () => void {
  const messaging = tryLoadMessaging();
  if (!messaging) return () => undefined;
  return messaging.onMessage((payload: unknown) => {
    const data = (payload as { data?: Record<string, string> })?.data ?? {};
    handler({ requestId: data.requestId ?? null });
  });
}

export function subscribeFirebaseTokenRefresh(
  handler: (token: string) => void,
): () => void {
  const messaging = tryLoadMessaging();
  if (!messaging) return () => undefined;
  return messaging.onTokenRefresh(handler);
}
