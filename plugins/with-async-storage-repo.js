/**
 * Expo config plugin — android/build.gradle의 allprojects.repositories에
 * @react-native-async-storage/async-storage의 local_repo maven 경로를 추가.
 *
 * async-storage v3는 org.asyncstorage.shared_storage:storage-android 아티팩트를
 * 패키지 내부 local_repo에 번들하지만, 해당 repo 경로를 프로젝트 레벨
 * allprojects.repositories에 자동 등록하지 않는다.
 */
const { withDangerousMod } = require('expo/config-plugins');
const fs = require('node:fs');
const path = require('node:path');

const MARKER = 'async-storage-local-repo';

function patchBuildGradle(contents, projectRoot) {
  if (contents.includes(MARKER)) {
    return contents;
  }

  const localRepoPath = path.join(
    projectRoot,
    'node_modules',
    '@react-native-async-storage',
    'async-storage',
    'android',
    'local_repo',
  );

  const repoLine = `    maven { url new File(rootProject.projectDir, "${path.relative(path.join(projectRoot, 'android'), localRepoPath)}") } // ${MARKER}`;

  const pattern = /(allprojects\s*\{\s*\n\s*repositories\s*\{)/;
  if (!pattern.test(contents)) {
    return contents;
  }

  return contents.replace(pattern, `$1\n${repoLine}`);
}

const withAsyncStorageRepo = (config) => {
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
      const patched = patchBuildGradle(original, cfg.modRequest.projectRoot);

      if (patched !== original) {
        fs.writeFileSync(buildGradlePath, patched, 'utf8');
      }

      return cfg;
    },
  ]);
};

module.exports = withAsyncStorageRepo;
