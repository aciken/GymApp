import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGlobalContext } from '../context/GlobalProvider';
import { useOnboardingContext } from '../context/OnboardingContext';
import Purchases from 'react-native-purchases';

export default function CreateAccount() {
  const router = useRouter();
  const { user, setUser, setIsAuthenticated, setIsPro, setIsNewUserOnboarding } = useGlobalContext();
  const { score } = useOnboardingContext(); // Get calculated score from context
  
  // 451475688741-f88vp91ttocl4of0lv8ja22m7d9ttqip.apps.googleusercontent.com
  let userName =  user?.name;

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      console.log(user?.name);
      
      const response = await axios.post('https://testosterone.onrender.com/auth/google', {
        token: userInfo.data.idToken,
        onboardingName: user?.name,
        baselineTestosterone: score * 10, // Send calculated score as baseline
      });

      if (response.status === 200 || response.status === 201) {
        const { user: userData, isNewUser } = response.data;
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);

        if (isNewUser) {
          setIsNewUserOnboarding(true);
          router.push('/onboarding/welcome');
          return;
        }
        
        // Check RevenueCat for pro status for existing users
        try {
          const customerInfo = await Purchases.getCustomerInfo();
          const isPro = customerInfo.entitlements.active['pro'] !== undefined;
          setIsPro(isPro);
          
          if (isPro) {
            router.push('/home');
          } else {
            router.push('/utils/Paywall');
          }
        } catch (error) {
          console.error("Error checking RevenueCat status:", error);
          router.push('/utils/Paywall'); // Default to paywall on error
        }
      } else {
        console.error('Google Sign-In failed:', response.data.message);
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      
 

      const { user, email, fullName } = credential;
 

      // Retrieve the name entered during onboarding
      const onboardingName = await AsyncStorage.getItem('onboardingName');

      console.log(userName);

      const response = await axios.post('https://testosterone.onrender.com/auth/apple', {
        appleId: user,
        email,
        onboardingName: userName,// This is the name from Apple (often null)
        baselineTestosterone: score * 10, // Send calculated score as baseline
      });


      if (response.status === 200 || response.status === 201) {
        const { user: userData, isNewUser } = response.data;
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);

        if (isNewUser) {
          setIsNewUserOnboarding(true);
          router.push('/onboarding/welcome');
          return;
        }
        
        // Check RevenueCat for pro status for existing users
        try {
          const customerInfo = await Purchases.getCustomerInfo();
          const isPro = customerInfo.entitlements.active['pro'] !== undefined;
          setIsPro(isPro);
          
          if (isPro) {
            router.push('/home');
          } else {
            router.push('/utils/Paywall');
          }
        } catch (error) {
          console.error("Error checking RevenueCat status:", error);
          router.push('/utils/Paywall'); // Default to paywall on error
        }
      } else {
        console.error('Apple Sign-In failed with status:', response.status, response.data.message);
      }

    } catch (e) {
      console.error('--- [AppleSignIn] CRITICAL ERROR CAUGHT ---');
      if (e.code === 'ERR_REQUEST_CANCELED') {
      } else {
        console.error('Apple Sign-In error object:', JSON.stringify(e, null, 2));
      }
      console.error('------------------------------------------');
    }
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '451475688741-ilikls36p28187o7vl665e9vocmha5nd.apps.googleusercontent.com', // Replace with your Web Client ID
      iosClientId: '451475688741-f88vp91ttocl4of0lv8ja22m7d9ttqip.apps.googleusercontent.com', // Replace with your iOS Client ID
      requestIdToken: true, // Explicitly request the ID token
    });

    // Animate content in
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
  }, []);

  return (
    <LinearGradient 
      colors={['#FF8C00', '#4B1D04', '#000000']} 
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <Animated.Image 
            source={require('../../assets/Portal4.png')} 
            style={[
              styles.portalImage,
              { 
                opacity: fadeAnim, 
                transform: [{ translateY: slideAnim }] 
              }
            ]} 
          />
          <Animated.Text 
            style={[
              styles.title,
              { 
                opacity: fadeAnim, 
                transform: [{ translateY: slideAnim }] 
              }
            ]}
          >
            BOOST the Test
          </Animated.Text>

          <Animated.View 
            style={[
              styles.optionsContainer,
              { opacity: fadeAnim }
            ]}
          >
            {/* Apple Sign In */}
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleAppleSignIn}
            >
              <Ionicons name="logo-apple" size={24} color="#FFFFFF" />
              <Text style={styles.optionButtonText}>Continue with Apple</Text>
            </TouchableOpacity>

            {/* Google Sign In */}
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleGoogleSignIn}
            >
              <Image source={require('../../assets/search.png')} style={styles.iconImage} />
              <Text style={styles.optionButtonText}>Continue with Google</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 50,
  },
  portalImage: {
    width: 320,
    height: 320,
    resizeMode: 'contain',
    marginBottom: 50,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  optionsContainer: {
    width: '100%',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  iconImage: {
    width: 24,
    height: 24,
  },
});
