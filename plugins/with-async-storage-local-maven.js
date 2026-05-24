/**
 * Expo config plugin — android/build.gradle에 async-storage v3 로컬 Maven 저장소 추가.
 *
 * 왜 필요한가:
 *   @react-native-async-storage/async-storage v3는 KMP 기반 storage-android 라이브러리를
 *   패키지 내 로컬 Maven 저장소(android/local_repo)에 포함한다.
 *   이 경로가 allprojects.repositories에 등록되지 않으면 Gradle 빌드가
 *   "Could not find org.asyncstorage.shared_storage:storage-android:1.0.0" 오류로 실패한다.
 *
 * 동작:
 *   allprojects.repositories 블록에 로컬 Maven 경로를 추가한다.
 *   이미 선언되어 있으면 no-op.
 */
const { withDangerousMod } = require('expo/config-plugins');
const fs = require('node:fs');
const path = require('node:path');

const MARKER = 'async-storage-local-repo';
const MAVEN_LINE = `    maven { url "\${rootDir}/../node_modules/@react-native-async-storage/async-storage/android/local_repo" } // ${MARKER}`;

const withAsyncStorageLocalMaven = (config) => {
  return withDangerousMod(config, [
    'android',
    async (cfg) => {
      const buildGradlePath = path.join(
        cfg.modRequest.platformProjectRoot,
        'build.gradle',
      );

      if (!fs.existsSync(buildGradlePath)) {
        return cfg;
      }

      const original = fs.readFileSync(buildGradlePath, 'utf8');

      if (original.includes(MARKER)) {
        return cfg;
      }

      const patched = original.replace(
        /(allprojects\s*\{[\s\S]*?repositories\s*\{[^\}]*)(maven\s*\{\s*url\s*['"]https:\/\/www\.jitpack\.io['"]\s*\})/,
        `$1$2\n${MAVEN_LINE}`,
      );

      if (patched !== original) {
        fs.writeFileSync(buildGradlePath, patched, 'utf8');
      }

      return cfg;
    },
  ]);
};

module.exports = withAsyncStorageLocalMaven;
