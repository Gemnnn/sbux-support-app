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
