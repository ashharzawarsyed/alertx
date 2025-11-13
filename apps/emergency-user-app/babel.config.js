module.exports = function (api) {
  api.cache(true);
  
  const plugins = [
    'react-native-reanimated/plugin',
  ];
  
  // Only add worklets plugin for native platforms, not web
  if (process.env.EXPO_PLATFORM !== 'web') {
    // Worklets plugin is auto-loaded by reanimated, but we can control it here if needed
  }

  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};
