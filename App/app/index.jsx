import { View, Text, TouchableOpacity, SafeAreaView, Animated, Dimensions, StyleSheet, ImageBackground } from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalContext } from './context/GlobalProvider';
import { useRouter } from 'expo-router';
import RocketAnimation from '../components/RocketAnimation';

// Get screen dimensions for responsive sizing
const { width, height } = Dimensions.get('window');

// Calculate a responsive font size based on screen width
const titleFontSize = width / 7;
const kickerFontSize = Math.max(14, Math.round(width / 18));

export default function WelcomePage() {
  const router = useRouter();
  const { isLoading, isAuthenticated, isPro, isNewUserOnboarding } = useGlobalContext();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [isSplashFinished, setIsSplashFinished] = useState(false);

  useEffect(() => {
    try {
      console.log(`[CRASH_DEBUG] Index: useEffect triggered. isLoading: ${isLoading}, isAuthenticated: ${isAuthenticated}, isPro: ${isPro}, isNewUserOnboarding: ${isNewUserOnboarding}`);
      
      if (!isLoading && isAuthenticated && !isNewUserOnboarding) {
        console.log(`[CRASH_DEBUG] Index: Conditions met for navigation. isPro: ${isPro}`);
        if (isPro === true) {
          console.log('[CRASH_DEBUG] Index: User is PRO. Replacing route with /home');
          router.replace('/home');
        } else if (isPro === false) {
          console.log('[CRASH_DEBUG] Index: User is NOT PRO. Replacing route with /utils/Paywall');
          router.replace('/utils/Paywall');
        }
      } else {
        console.log('[CRASH_DEBUG] Index: Conditions for navigation NOT met. Doing nothing.');
      }
    } catch (error) {
      console.error('[CRASH_DEBUG] Index: CRITICAL ERROR in navigation useEffect!', error);
    }
  }, [isLoading, isAuthenticated, isPro, isNewUserOnboarding]);

  useEffect(() => {
    if (isSplashFinished) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isSplashFinished]);

  if (!isSplashFinished) {
    return <RocketAnimation onAnimationFinish={() => setIsSplashFinished(true)} />;
  }

  return (
    <ImageBackground
      source={require('../assets/Background2.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
        style={styles.overlay}
      >
        <SafeAreaView style={styles.safeArea}>
          <StatusBar style="light" />
          
          <Animated.View 
            style={[
              styles.contentContainer,
              { 
                opacity: fadeAnim, 
                transform: [{ translateY: slideAnim }] 
              }
            ]}
          >
            {/* Top spacer + small workout icon */}
            <View style={styles.logoContainer}>
              <View style={styles.appIconCircle}>
                <Ionicons name="barbell-outline" size={26} color="#FFFFFF" />
              </View>
            </View>

            {/* Middle Section - Welcome Text */}
            <View style={styles.welcomeContainer}>
              <View style={styles.heroTitle}> 
                <Text style={styles.heroKicker}>WORKOUT</Text>
                <Text style={styles.heroMain} numberOfLines={1} adjustsFontSizeToFit>
                  TRACKER
                </Text>
                <View style={styles.accentBar} />
                <Text style={styles.welcomeSubtitle}>
                  Log your training, build streaks, and watch your strength climb.
                </Text>

                <View style={styles.featureRow}>
                  <View style={styles.featurePill}>
                    <Ionicons name="checkmark-circle-outline" size={16} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.featureText}>Track sets</Text>
                  </View>
                  <View style={styles.featurePill}>
                    <Ionicons name="trending-up-outline" size={16} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.featureText}>Progress</Text>
                  </View>
                  <View style={styles.featurePill}>
                    <Ionicons name="flame-outline" size={16} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.featureText}>Streaks</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Bottom Section - Buttons */}
            <View style={styles.buttonContainer}>
              <Link href="/onboarding/why" asChild>
                <TouchableOpacity style={styles.continueButton}>
                  <Text style={styles.continueButtonText}>
                    Start Training
                  </Text>
                </TouchableOpacity>
              </Link>
              
              {/* <Link href="/onboarding/createAccount" asChild>
                <TouchableOpacity>
                  <Text style={styles.signInText}>
                    Already have an account? Sign In
                  </Text>
                </TouchableOpacity>
              </Link> */}
            </View>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  appIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(245,158,11,1)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 6,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    flex: 1,
    justifyContent: 'center',
  },
  heroTitle: {
    alignItems: 'center',
    gap: 6,
  },
  heroKicker: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: kickerFontSize,
    fontWeight: '800',
    letterSpacing: 4,
  },
  heroMain: {
    color: '#FFFFFF',
    fontSize: titleFontSize,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: 'rgba(245, 158, 11, 0.45)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 22,
    paddingHorizontal: 12,
  },
  accentBar: {
    marginTop: 6,
    width: '55%',
    height: 2,
    backgroundColor: 'rgba(245,158,11,0.7)',
    shadowColor: 'rgba(245,158,11,1)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  welcomeSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  featureRow: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  featureText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  continueButton: {
    backgroundColor: '#FFFFFF',
    width: '90%',
    paddingVertical: 18,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  continueButtonText: {
    color: '#000000',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 5,
  },
  signInText: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontSize: 16,
  },
});
