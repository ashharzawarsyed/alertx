const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Fix for import.meta on web
config.resolver = {
  ...config.resolver,
  sourceExts: [...(config.resolver?.sourceExts || []), 'mjs', 'cjs'],
  // Resolve worklets issues on web by providing empty modules
  resolveRequest: (context, moduleName, platform) => {
    // Disable worklets on web platform
    if (platform === 'web' && moduleName === 'react-native-worklets') {
      return {
        type: 'empty',
      };
    }
    // Use default resolver for everything else
    return context.resolveRequest(context, moduleName, platform);
  },
};

config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

module.exports = config;
