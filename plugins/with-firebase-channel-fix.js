/**
 * Expo config plugin — AndroidManifest의 Firebase 채널 meta-data에 tools:replace 추가.
 *
 * 왜 필요한가:
 *   expo-notifications 플러그인이 생성하는
 *   com.google.firebase.messaging.default_notification_channel_id meta-data와
 *   react-native-firebase/messaging 패키지의 AndroidManifest가 동일한 속성을 선언해
 *   Manifest merger 충돌이 발생한다.
 *   tools:replace="android:value"를 추가하면 merger가 이 값을 우선 사용한다.
 */
const { withAndroidManifest } = require('expo/config-plugins');

const CHANNEL_META_NAME =
  'com.google.firebase.messaging.default_notification_channel_id';

const withFirebaseChannelFix = (config) => {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults;
    const application = manifest.manifest.application?.[0];

    if (!application?.['meta-data']) {
      return cfg;
    }

    const metaData = application['meta-data'];
    const target = metaData.find(
      (m) => m.$?.['android:name'] === CHANNEL_META_NAME,
    );

    if (target && !target.$?.['tools:replace']) {
      target.$['tools:replace'] = 'android:value';
    }

    return cfg;
  });
};

module.exports = withFirebaseChannelFix;
