import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useGlobalContext } from '../context/GlobalProvider';

export default function Welcome() {
  const router = useRouter();
  const { user } = useGlobalContext();
  const contentFadeAnim = useRef(new Animated.Value(0)).current;
  const contentSlideAnim = useRef(new Animated.Value(30)).current;

  const [displayedText, setDisplayedText] = useState('');
  const fullText = `Hello ${user?.name || 'friend'}, you are getting closer to changing your life.`;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentFadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(contentSlideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();

    let charTimeout;
    const typeChar = (index) => {
      if (index < fullText.length) {
        setDisplayedText(prev => prev + fullText[index]);
        if (fullText[index] !== ' ') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        charTimeout = setTimeout(() => typeChar(index + 1), 50);
      } else {
        setTimeout(() => {
          router.push('/onboarding/programPreview');
        }, 1000); // Wait a second before navigating
      }
    };

    const typingDelay = setTimeout(() => typeChar(0), 800);
    return () => {
      clearTimeout(typingDelay);
      clearTimeout(charTimeout);
    };
  }, []);

  return (
    <LinearGradient
      colors={["#0A0A0D", "#4B240A", "#B46010"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.content, { opacity: contentFadeAnim, transform: [{ translateY: contentSlideAnim }] }]}>
          <Text style={styles.title}>{displayedText}</Text>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, justifyContent: 'center' },
  content: { paddingHorizontal: 40 },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 44,
  },
});
