// Entry point for Expo Router
import 'expo-router/entry';
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';

// ✅ Safe AdMob initialization after Hermes bridge is ready
function safeInit() {
  setImmediate(async () => {
    try {
      const { default: mobileAds, MaxAdContentRating } = await import('react-native-google-mobile-ads');
      await mobileAds().setRequestConfiguration({
        maxAdContentRating: MaxAdContentRating.PG,
        tagForChildDirectedTreatment: true,
        tagForUnderAgeOfConsent: true,
        testDeviceIdentifiers: ['EMULATOR'],
      });
      await mobileAds().initialize();
      console.log("✅ AdMob initialized safely after JS bridge");
    } catch (e) {
      console.log("❌ Failed to init AdMob:", e?.message ?? e);
    }
  });
}

function Root() {
  safeInit();
  return null; // Expo Router takes over
}

AppRegistry.registerComponent(appName, () => Root);
