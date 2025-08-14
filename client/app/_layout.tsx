import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { AppRegistry, Platform } from 'react-native';

// app.json must use expo.name.
import appConfig from '../app.json'; // {"expo": {...}}
type AppJson = { expo: { name: string } };
const appName: string = (appConfig as AppJson).expo.name;

import { useColorScheme } from 'hooks/useColorScheme';

SplashScreen.preventAutoHideAsync(); // Prevent splash screen from auto-hiding

console.log('🔍 Starting app/_layout.tsx execution');

// ⚠️ Tracking/ads initialization is not performed at all in development mode.
// Use "dynamic import" to delay loading native modules.
const requestTrackingPermissionIfNeeded = async () => {
  if (__DEV__) {
    console.log('🔧 Dev mode: skip tracking permission');
    return;
  }
  if (Platform.OS === 'ios') {
    try {
      const { getTrackingStatus, requestTrackingPermission } = await import('react-native-tracking-transparency');
      const trackingStatus = await getTrackingStatus();
      console.log('🔍 Current tracking status:', trackingStatus);
      if (trackingStatus === 'not-determined') {
        const permission = await requestTrackingPermission();
        console.log('🔍 Tracking permission result:', permission);
      }
    } catch (e) {
      console.log('ℹ️ Tracking module not available in this build:', (e as any)?.message ?? e);
    }
  }
};

const initMobileAdsIfNeeded = async () => {
  if (__DEV__) {
    console.log('🔧 Dev mode: skip mobile ads init');
    return;
  }
  try {
    // Avoid native dependencies in development mode by reading modules only from here.
    const { default: mobileAds, MaxAdContentRating } = await import('react-native-google-mobile-ads');

    await mobileAds().setRequestConfiguration({
      maxAdContentRating: MaxAdContentRating.PG,
      tagForChildDirectedTreatment: true,
      tagForUnderAgeOfConsent: true,
      testDeviceIdentifiers: ['EMULATOR'],
    });

    const adapterStatuses = await mobileAds().initialize();
    console.log('✅ AdMob Initialized Successfully');
    console.log('🔍 Adapter Statuses:', adapterStatuses);
  } catch (error) {
    console.log('ℹ️ Skipping AdMob init (module unavailable in this build):', (error as any)?.message ?? error);
  }
};

if (Platform.OS === 'web') {
  console.log('🔍 Running on web platform');
  const rootTag = document.getElementById('root') || document.getElementById(appName);
  AppRegistry.runApplication(appName, { rootTag });
} else {
  console.log('🔍 Running on native platform');
  requestTrackingPermissionIfNeeded()
    .then(() => initMobileAdsIfNeeded())
    .finally(() => {
      console.log('🔍 Registering component...');
      AppRegistry.registerComponent(appName, () => RootLayout);
    });
}

function RootLayout() {
  const colorScheme = useColorScheme();
  const [appReady, setAppReady] = useState(false); // Track app readiness
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    async function prepare() {
      if (fontsLoaded) {
        // Perform any additional app initialization here
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate loading delay (e.g., API calls)
        setAppReady(true); // Set app as ready
        await SplashScreen.hideAsync(); // Hide splash screen
      }
    }
    prepare();
  }, [fontsLoaded]);

  if (!appReady) {
    return null; // Prevent app rendering until ready
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}

export default RootLayout;
