// import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// import { useFonts } from 'expo-font';
// import { Stack } from 'expo-router';
// import * as SplashScreen from 'expo-splash-screen';
// import { useEffect, useState } from 'react';
// import 'react-native-reanimated';
// import { AppRegistry, Platform } from 'react-native';
// // import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';
// // import { getTrackingStatus, requestTrackingPermission } from 'react-native-tracking-transparency';

// import { useColorScheme } from 'hooks/useColorScheme';
// import { name as appName } from '../app.json';

// SplashScreen.preventAutoHideAsync(); // Prevent splash screen from auto-hiding

// console.log('🔍 Starting app/_layout.tsx execution');

// const requestTrackingPermissionIfNeeded = async () => {
//   console.log('🔍 Checking tracking status...');
//   if (Platform.OS === 'ios') {
//     const trackingStatus = await getTrackingStatus();
//     console.log('🔍 Current tracking status:', trackingStatus);
//     if (trackingStatus === 'not-determined') {
//       const permission = await requestTrackingPermission();
//       console.log('🔍 Tracking permission result:', permission);
//     }
//   }
// };

// mobileAds()
//   .setRequestConfiguration({
//     // Update all future requests suitable for parental guidance
//     maxAdContentRating: MaxAdContentRating.PG,

//     // Indicates that you want your content treated as child-directed for purposes of COPPA.
//     tagForChildDirectedTreatment: true,

//     // Indicates that you want the ad request to be handled in a
//     // manner suitable for users under the age of consent.
//     tagForUnderAgeOfConsent: true,

//     // An array of test device IDs to allow.
//     testDeviceIdentifiers: ['EMULATOR'],
//   })
//   .then(() => {
//     console.log('🔍 Request configuration set successfully');

//     mobileAds()
//       .initialize()
//       .then(adapterStatuses => {
//         console.log('✅ AdMob Initialized Successfully');
//         console.log('🔍 Adapter Statuses:', adapterStatuses);
//       })
//       .catch(error => {
//         console.log('❌ AdMob Initialization Failed:', error);
//       });
//   })
//   .catch(error => {
//     console.log('❌ Failed to set request configuration:', error);
//   });

// if (Platform.OS === 'web') {
//   console.log('🔍 Running on web platform');
//   const rootTag = document.getElementById('root') || document.getElementById(appName);
//   AppRegistry.runApplication(appName, { rootTag });
// } else {
//   console.log('🔍 Running on native platform');
//   requestTrackingPermissionIfNeeded().finally(() => {
//     console.log('🔍 Registering component...');
//     AppRegistry.registerComponent(appName, () => RootLayout);
//   });
// }

// function RootLayout() {
//   const colorScheme = useColorScheme();
//   const [appReady, setAppReady] = useState(false); // Track app readiness
//   const [fontsLoaded] = useFonts({
//     SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
//   });

//   useEffect(() => {
//     async function prepare() {
//       if (fontsLoaded) {
//         // Perform any additional app initialization here
//         await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate loading delay (e.g., API calls)
//         setAppReady(true); // Set app as ready
//         await SplashScreen.hideAsync(); // Hide splash screen
//       }
//     }

//     prepare();
//   }, [fontsLoaded]);

//   if (!appReady) {
//     return null; // Prevent app rendering until ready
//   }

//   return (
//     <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
//       <Stack>
//         <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//         <Stack.Screen name="+not-found" />
//       </Stack>
//     </ThemeProvider>
//   );
// }

// export default RootLayout;

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from 'hooks/useColorScheme';

SplashScreen.preventAutoHideAsync(); // Prevent splash screen from auto-hiding

export default function RootLayout() {

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
