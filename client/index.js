// import { registerRootComponent } from 'expo';

// import App from './App';

// // registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// // It also ensures that whether you load the app in Expo Go or in a native build,
// // the environment is set up appropriately
// registerRootComponent(App);

import { AppRegistry, Platform } from 'react-native';
import App from './app/(tabs)/index';
import { name as appName } from './app.json';
import mobileAds from 'react-native-google-mobile-ads';

mobileAds()
  .initialize()
  .then(() => {
    console.log('✅ AdMob Initialized Successfully');
  });

if (Platform.OS === 'web') {
  const rootTag = document.getElementById('root') || document.getElementById(appName);
  AppRegistry.runApplication(appName, { rootTag });
} else {
  AppRegistry.registerComponent(appName, () => App);
}

