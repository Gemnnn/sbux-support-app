// import { registerRootComponent } from 'expo';

// import App from './App';

// // registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// // It also ensures that whether you load the app in Expo Go or in a native build,
// // the environment is set up appropriately
// registerRootComponent(App);

import { AppRegistry, Platform } from 'react-native';
import App from './app/(tabs)/index';
import { name as appName } from './app.json';
import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';
import { getTrackingStatus, requestTrackingPermission } from 'react-native-tracking-transparency';

console.log('🔍 Starting index.js execution');

const requestTrackingPermissionIfNeeded = async () => {
  console.log('🔍 Checking tracking status...');
  if (Platform.OS === 'ios') {
    const trackingStatus = await getTrackingStatus();
    console.log('🔍 Current tracking status:', trackingStatus);
    if (trackingStatus === 'not-determined') {
      const permission = await requestTrackingPermission();
      console.log('🔍 Tracking permission result:', permission);
    }
  }
};

mobileAds()
  .setRequestConfiguration({
    // Update all future requests suitable for parental guidance
    maxAdContentRating: MaxAdContentRating.PG,

    // Indicates that you want your content treated as child-directed for purposes of COPPA.
    tagForChildDirectedTreatment: true,

    // Indicates that you want the ad request to be handled in a
    // manner suitable for users under the age of consent.
    tagForUnderAgeOfConsent: true,

    // An array of test device IDs to allow.
    testDeviceIdentifiers: ['EMULATOR'],
  })
  .then(() => {
    console.log('🔍 Request configuration set successfully');

    mobileAds()
      .initialize()
      .then(adapterStatuses => {
        console.log('✅ AdMob Initialized Successfully');
        console.log('🔍 Adapter Statuses:', adapterStatuses);
      })
      .catch(error => {
        console.log('❌ AdMob Initialization Failed:', error);
      });
  })
  .catch(error => {
    console.log('❌ Failed to set request configuration:', error);
  });

if (Platform.OS === 'web') {
  console.log('🔍 Running on web platform');
  const rootTag = document.getElementById('root') || document.getElementById(appName);
  AppRegistry.runApplication(appName, { rootTag });
} else {
  console.log('🔍 Running on native platform');
  requestTrackingPermissionIfNeeded().finally(() => {
    console.log('🔍 Registering component...');
    AppRegistry.registerComponent(appName, () => App);
  });
}