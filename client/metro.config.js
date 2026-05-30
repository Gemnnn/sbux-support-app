// // Learn more https://docs.expo.io/guides/customizing-metro
// const { getDefaultConfig } = require('expo/metro-config');

// // /** @type {import('expo/metro-config').MetroConfig} */
// // const config = getDefaultConfig(__dirname);

// // module.exports = defaultConfig;

// // Fetch the default configuration for Metro
// module.exports = (() => {
//   const config = getDefaultConfig(__dirname);

//   config.resolver.sourceExts = ['js', 'jsx', 'ts', 'tsx', 'json'];
//   config.resolver.alias = {
//     '@': './', 
//     services: "./services", 
//   };

//   return config;
// })();

// Learn more: https://docs.expo.io/guides/customizing-metro
// metro.config.js
// const { getDefaultConfig } = require('@react-native/metro-config'); // RN 0.79
// const path = require('path');

// const config = getDefaultConfig(__dirname);

// // sourceExts
// config.resolver.sourceExts.push('jsx', 'ts', 'tsx');

// // alias 
// config.resolver.alias = {
//   assets: path.resolve(__dirname, 'assets'),
//   components: path.resolve(__dirname, 'components'),
//   app: path.resolve(__dirname, 'app'),
//   services: path.resolve(__dirname, 'services'),
//   '@': path.resolve(__dirname),
// };

// // watchFolders 
// config.watchFolders = [path.resolve(__dirname)];

// module.exports = config;


///

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
