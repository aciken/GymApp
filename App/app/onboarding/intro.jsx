import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

export default function OnboardingIntro() {
  const router = useRouter();
  const contentFadeAnim = useRef(new Animated.Value(0)).current;
  const contentSlideAnim = useRef(new Animated.Value(30)).current;
  const footerFadeAnim = useRef(new Animated.Value(0)).current;

  const [displayedText, setDisplayedText] = useState('');
  const fullText = "First, let's find your current testosterone levels.";

  useEffect(() => {
    // Animate content container in
    Animated.parallel([
      Animated.timing(contentFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(contentSlideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Typewriter effect after content animates in
    let charTimeout;
    const chars = fullText.split('');

    const typeChar = (index) => {
      if (index < chars.length) {
        setDisplayedText(prev => prev + chars[index]);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        charTimeout = setTimeout(() => typeChar(index + 1), 25);
      } else {
        // After typing, animate footer in
        Animated.timing(footerFadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }
    };

    const initialTypingDelay = setTimeout(() => {
      typeChar(0);
    }, 800); // Start after content animation

    return () => {
      clearTimeout(initialTypingDelay);
      clearTimeout(charTimeout);
    };
  }, []);

  return (
    <LinearGradient
      colors={["#0A0A0D", "#4B240A", "#B46010"]}
      locations={[0, 0.5, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <Animated.View 
          style={[
            styles.content,
            { 
              opacity: contentFadeAnim, 
              transform: [{ translateY: contentSlideAnim }] 
            }
          ]}
        >
          <Text style={styles.title}>
            {displayedText}
          </Text>
        </Animated.View>

        <Animated.View 
          style={[
            styles.footer,
            { 
              opacity: footerFadeAnim
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/onboarding/question1');
            }}
          >
            <Text style={styles.buttonText}>Let's start</Text>
          </TouchableOpacity>
        </Animated.View>
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
    justifyContent: 'space-between',
  },
  header: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 10,
    alignSelf: 'flex-start',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 38,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  footer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  button: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.35)',
    shadowColor: 'rgba(245,158,11,0.5)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
  buttonText: {
    color: '#0E0E0E',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
