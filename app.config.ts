import {
  AndroidConfig,
  type ConfigPlugin,
  withAndroidManifest,
} from '@expo/config-plugins';
import type { ExpoConfig } from 'expo/config';
import { existsSync } from 'node:fs';
import { resolve as pathResolve } from 'node:path';

function resolveNaverMapClientId() {
  const directClientId = process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID;

  if (directClientId) {
    return directClientId;
  }

  const legacyPageUrl = process.env.EXPO_PUBLIC_NAVER_MAP_PAGE_URL;

  if (!legacyPageUrl) {
    return '';
  }

  try {
    return new URL(legacyPageUrl).searchParams.get('ncpKeyId') ?? '';
  } catch {
    return '';
  }
}

const naverMapClientId = resolveNaverMapClientId();

// Firebase 자격증명 파일이 실제로 존재하는 경우에만 plugin/googleServicesFile을 활성화.
// 부재 시 prebuild가 실패하지 않도록 그래스풀하게 누락 처리한다.
const androidGoogleServicesPath = pathResolve(__dirname, './google-services.json');
const iosGoogleServicesPath = pathResolve(__dirname, './GoogleService-Info.plist');
const hasAndroidFirebase = existsSync(androidGoogleServicesPath);
const hasIosFirebase = existsSync(iosGoogleServicesPath);

const firebasePlugins: ExpoConfig['plugins'] = [];
if (hasAndroidFirebase || hasIosFirebase) {
  firebasePlugins.push('@react-native-firebase/app');
  firebasePlugins.push('@react-native-firebase/messaging');
}

const config: ExpoConfig = {
  name: '교움',
  slug: 'gyoum-mobile',
  version: '1.0.0',
  scheme: 'gyoum',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier: 'com.gyoum.mobile',
    ...(hasIosFirebase ? { googleServicesFile: './GoogleService-Info.plist' } : {}),
    infoPlist: {
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true,
        NSAllowsLocalNetworking: true,
      },
    },
  },
  android: {
    package: 'com.gyoum.mobile',
    ...(hasAndroidFirebase ? { googleServicesFile: './google-services.json' } : {}),
  },
  plugins: [
    'expo-router',
    [
      'expo-dev-client',
      {
        launchMode: 'launcher',
      },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          '교움이 현재 위치를 사용해 가장 가까운 지하철역과 도움 요청 가능 역을 안내합니다.',
      },
    ],
    [
      '@mj-studio/react-native-naver-map',
      {
        client_id: naverMapClientId,
      },
    ],
    withResolvedNaverMapAndroidClientId as never,
    [
      'expo-build-properties',
      {
        android: {
          extraMavenRepos: ['https://repository.map.naver.com/archive/maven'],
        },
      },
    ],
    // @react-native-firebase의 Swift pod(FirebaseCoreInternal)가
    // ObjC pod인 GoogleUtilities를 import하려면 modular_headers 필요.
    // expo-build-properties 55에는 useModularHeaders 옵션이 없어 자체 plugin으로 처리.
    './plugins/with-use-modular-headers',
    './plugins/with-async-storage-local-maven',
    './plugins/with-firebase-channel-fix',
    [
      'expo-notifications',
      {
        defaultChannel: 'support-request-updates',
      },
    ],
    [
      'expo-font',
      {
        fonts: [
          './assets/font/Pretendard-Regular.otf',
          './assets/font/Pretendard-Medium.otf',
          './assets/font/Pretendard-SemiBold.otf',
          './assets/font/Pretendard-Bold.otf',
        ],
      },
    ],
    ...firebasePlugins,
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
};

export default config;
