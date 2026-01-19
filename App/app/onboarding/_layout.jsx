import { Stack } from 'expo-router';
import { OnboardingProvider } from '../context/OnboardingContext';

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'slide_from_right',
          animationDuration: 300,
        }}
      >
        <Stack.Screen name="question1" options={{ headerShown: false }} />
        <Stack.Screen name="question2" options={{ headerShown: false }} />
        <Stack.Screen name="question3" options={{ headerShown: false }} />
        <Stack.Screen name="question4" options={{ headerShown: false }} />
        <Stack.Screen name="question5" options={{ headerShown: false }} />
        <Stack.Screen name="question6" options={{ headerShown: false }} />
        <Stack.Screen name="question7" options={{ headerShown: false }} />
        <Stack.Screen name="question8" options={{ headerShown: false }} />
        <Stack.Screen name="question9" options={{ headerShown: false }} />
        <Stack.Screen name="question10" options={{ headerShown: false }} />
        <Stack.Screen name="question11" options={{ headerShown: false }} />
        <Stack.Screen name="question12" options={{ headerShown: false }} />
        <Stack.Screen name="why" options={{ headerShown: false }} />
        <Stack.Screen name="declineInfo" options={{ headerShown: false }} />
        <Stack.Screen name="lessOfMan" options={{ headerShown: false }} />
        <Stack.Screen name="weaknessInfo" options={{ headerShown: false }} />
        <Stack.Screen name="dietExerciseInfo" options={{ headerShown: false }} />
        <Stack.Screen name="guidanceInfo" options={{ headerShown: false }} />
        <Stack.Screen name="benefitsGraph" options={{ headerShown: false }} />
        <Stack.Screen name="journeyGraph" options={{ headerShown: false }} />
        <Stack.Screen name="transformLife" options={{ headerShown: false }} />
        <Stack.Screen name="createAccount" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="dosAndDonts" options={{ headerShown: false }} />
        <Stack.Screen name="ranksInfo" options={{ headerShown: false }} />
        <Stack.Screen name="rankCharacters" options={{ headerShown: false }} />
        <Stack.Screen name="yourRank" options={{ headerShown: false }} />
        <Stack.Screen name="programPreview" options={{ headerShown: false }} />
        <Stack.Screen name="calculating" options={{ headerShown: false }} />
        <Stack.Screen 
          name="results" 
          options={{ 
            headerShown: false,
            animation: 'fade',
            gestureEnabled: false 
          }} 
        />
      </Stack>
    </OnboardingProvider>
  );
}
