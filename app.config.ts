import {
  AndroidConfig,
  type ConfigPlugin,
  withAndroidManifest,
} from '@expo/config-plugins';
import type { ExpoConfig } from 'expo/config';

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

const withResolvedNaverMapAndroidClientId: ConfigPlugin = (config) =>
  withAndroidManifest(config, (config) => {
    const mainApplication =
      AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);
    const metadataKeys = [
      'com.naver.maps.map.CLIENT_ID',
      'com.naver.maps.map.NCP_KEY_ID',
    ];

    if (!mainApplication['meta-data']) {
      mainApplication['meta-data'] = [];
    }

    metadataKeys.forEach((name) => {
      const existingMetadata = mainApplication['meta-data']?.find(
        (item) => item.$['android:name'] === name,
      );

      if (existingMetadata) {
        existingMetadata.$['android:value'] = naverMapClientId;
        return;
      }

      AndroidConfig.Manifest.addMetaDataItemToMainApplication(
        mainApplication,
        name,
        naverMapClientId,
      );
    });

    return config;
  });

const config: ExpoConfig = {
  name: '교움',
  slug: 'gyoum-mobile',
  version: '1.0.0',
  scheme: 'gyoum',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier: 'com.gyoum.mobile',
    infoPlist: {
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true,
        NSAllowsLocalNetworking: true,
      },
    },
  },
  android: {
    package: 'com.gyoum.mobile',
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
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
};

export default config;
