import React, { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { GlobalProvider } from './context/GlobalProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RocketAnimation from '../components/RocketAnimation';
// import * as Font from 'expo-font';

// This is the native splash screen logic. It's commented out for now
// so you don't have to rebuild the app to see changes.
// When you are ready to build, we can uncomment this.
// SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // const [fontsLoaded, setFontsLoaded] = useState(false);
  const [animationFinished, setAnimationFinished] = useState(false);

  // useEffect(() => {
  //   async function loadFonts() {
  //     await Font.loadAsync({
  //       'Cinzel-Bold': require('../assets/fonts/Cinzel-Bold.ttf'),
  //     });
  //     setFontsLoaded(true);
  //   }
  //   loadFonts();
  // }, []);

  // if (!fontsLoaded) {
  //   // You can return a minimal loading component here if you want,
  //   // but the animated splash will cover it.
  //   return null;
  // }

  if (!animationFinished) {
    return (
      <RocketAnimation onAnimationFinish={() => setAnimationFinished(true)} />
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000000' }}>
      <GlobalProvider>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000000' } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="allBadges" options={{ headerShown: false }} />
          <Stack.Screen name="badgeDetails" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="rankTimeline" options={{ headerShown: false }} />
          <Stack.Screen
            name="mealHistory"
            options={{
              headerShown: false,
              presentation: 'transparentModal',
              animation: 'slide_from_bottom'
            }}
          />
          <Stack.Screen name="modal" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="onboarding" />
          <Stack.Screen
            name="utils/Paywall"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </GlobalProvider>
    </GestureHandlerRootView>
  );
}
