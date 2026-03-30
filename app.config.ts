import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: '교움',
  slug: 'gyoum-mobile',
  version: '1.0.0',
  scheme: 'gyoum',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier: 'com.gyoum.mobile',
  },
  android: {
    package: 'com.gyoum.mobile',
  },
  plugins: [
    'expo-router',
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          '교움이 현재 위치를 사용해 가장 가까운 지하철역과 도움 요청 가능 역을 안내합니다.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
};

export default config;
