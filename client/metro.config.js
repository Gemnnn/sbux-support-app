// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

// /** @type {import('expo/metro-config').MetroConfig} */
// const config = getDefaultConfig(__dirname);

// module.exports = defaultConfig;

// Fetch the default configuration for Metro
module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  config.resolver.sourceExts = ['js', 'jsx', 'ts', 'tsx', 'json'];
  config.resolver.alias = {
    '@': './', 
    services: "./services", 
  };

  return config;
})();