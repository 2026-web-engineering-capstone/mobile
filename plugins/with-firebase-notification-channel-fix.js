/**
 * Expo config plugin — AndroidManifest.xml의 default_notification_channel_id
 * meta-data에 tools:replace="android:value" 추가.
 *
 * expo-notifications와 @react-native-firebase/messaging 모두 같은
 * meta-data를 선언하여 manifest merger 충돌이 발생한다.
 * tools:replace로 앱 매니페스트 값이 우선하도록 한다.
 */
const { withAndroidManifest } = require('expo/config-plugins');

const withFirebaseNotificationChannelFix = (config) => {
  return withAndroidManifest(config, (cfg) => {
    const mainApp = cfg.modResults.manifest.application?.[0];
    if (!mainApp) return cfg;

    const metaDataArray = mainApp['meta-data'] || [];

    for (const meta of metaDataArray) {
      if (
        meta.$?.['android:name'] ===
        'com.google.firebase.messaging.default_notification_channel_id'
      ) {
        meta.$['tools:replace'] = 'android:value';
        break;
      }
    }

    return cfg;
  });
};

module.exports = withFirebaseNotificationChannelFix;
