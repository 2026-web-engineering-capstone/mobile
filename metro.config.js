const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);
const zustandMiddlewarePath = require.resolve('zustand/middleware');
const useLatestCallbackPath = path.join(__dirname, 'src/lib/use-latest-callback.ts');

const webModuleOverrides = {
  'zustand/middleware': zustandMiddlewarePath,
  'use-latest-callback': useLatestCallbackPath,
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName in webModuleOverrides) {
    return {
      filePath: webModuleOverrides[moduleName],
      type: 'sourceFile',
    };
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withUniwindConfig(config, {
  cssEntryFile: './src/global.css',
  dtsFile: './src/uniwind-types.d.ts',
});
