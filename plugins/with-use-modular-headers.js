/**
 * Expo config plugin — Podfile에 `use_modular_headers!` 삽입.
 *
 * 왜 필요한가:
 *   @react-native-firebase의 FirebaseCoreInternal(Swift pod)가 ObjC pod인
 *   GoogleUtilities를 import하려면 modular header가 필요하다. CocoaPods는
 *   기본적으로 Swift pod가 ObjC pod을 static library로 import할 수 없다고
 *   거부하며, 이를 해결하려면 Podfile에 `use_modular_headers!`를 선언해야 한다.
 *
 *   expo-build-properties 55에는 이에 해당하는 옵션이 없으므로(useFrameworks만
 *   존재) 자체 plugin으로 Podfile을 직접 패치한다. CNG 원칙상 prebuild가
 *   매번 새 ios/를 만들어도 이 plugin이 자동 재적용된다.
 *
 * 동작:
 *   ios/Podfile의 첫 번째 `target '...' do` 블록 바로 위에 한 줄을 추가한다.
 *   이미 선언되어 있으면 no-op.
 */
const { withDangerousMod } = require('expo/config-plugins');
const fs = require('node:fs');
const path = require('node:path');

const DIRECTIVE = 'use_modular_headers!';

function patchPodfile(contents) {
  if (contents.includes(DIRECTIVE)) {
    return contents;
  }

  // 첫 `target '...' do` 라인 직전에 directive를 끼워 넣는다.
  const targetRe = /^(target\s+['"][^'"]+['"]\s+do)/m;
  if (!targetRe.test(contents)) {
    // 예상 형식이 아니면 안전하게 no-op.
    return contents;
  }

  return contents.replace(targetRe, `${DIRECTIVE}\n\n$1`);
}

const withUseModularHeaders = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const podfilePath = path.join(
        cfg.modRequest.platformProjectRoot,
        'Podfile',
      );

      if (!fs.existsSync(podfilePath)) {
        return cfg;
      }

      const original = fs.readFileSync(podfilePath, 'utf8');
      const patched = patchPodfile(original);

      if (patched !== original) {
        fs.writeFileSync(podfilePath, patched, 'utf8');
      }

      return cfg;
    },
  ]);
};

module.exports = withUseModularHeaders;
