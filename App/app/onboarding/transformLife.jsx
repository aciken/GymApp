import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useGlobalContext } from '../context/GlobalProvider';

export default function TransformLife() {
  const router = useRouter();
  const { user, setUser } = useGlobalContext();
  const [name, setName] = useState('');

  const contentFadeAnim = useRef(new Animated.Value(0)).current;
  const contentSlideAnim = useRef(new Animated.Value(30)).current;
  
  const buttonFadeAnim = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current; // Start at 1
  const inputFadeAnim = useRef(new Animated.Value(0)).current;
  const inputSlideAnim = useRef(new Animated.Value(20)).current;
  const continueButtonFadeAnim = useRef(new Animated.Value(0)).current;

  const [displayedText, setDisplayedText] = useState('');
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const [isInputVisible, setIsInputVisible] = useState(false);
  const fullText = "Are you ready to transform your life?";

  useEffect(() => {
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

    let charTimeout;
    const chars = fullText.split('');

    const typeChar = (index) => {
      if (index < chars.length) {
        setDisplayedText(prev => prev + chars[index]);
        if (chars[index] !== ' ') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        charTimeout = setTimeout(() => typeChar(index + 1), 50);
      } else {
        setIsButtonVisible(true);
        Animated.timing(buttonFadeAnim, {
          toValue: 1,
          duration: 500,
          delay: 200,
          useNativeDriver: true,
        }).start();
      }
    };

    const initialTypingDelay = setTimeout(() => {
      typeChar(0);
    }, 800);

    return () => {
      clearTimeout(initialTypingDelay);
      clearTimeout(charTimeout);
    };
  }, []);

  const handleButtonPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Animate title up, and button out
    Animated.parallel([
      Animated.timing(contentSlideAnim, {
        toValue: -100, // Move title up, but less
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(buttonFadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsButtonVisible(false);
      setIsInputVisible(true);

      // Animate input in (center) and continue button in (bottom)
      Animated.parallel([
        Animated.timing(inputFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(inputSlideAnim, {
          toValue: 0,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(continueButtonFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleContinue = () => {
    if (name.trim()) {
      setUser({ ...user, name: name.trim() });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push('/onboarding/journeyGraph');
    }
  };

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

          {isInputVisible && (
            <Animated.View style={[styles.inputContainer, { opacity: inputFadeAnim, transform: [{ translateY: inputSlideAnim }] }]}>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor="#A9A9A9"
                value={name}
                onChangeText={setName}
              />
            </Animated.View>
          )}
        </Animated.View>

        <View style={styles.footer}>
          {isButtonVisible && (
            <Animated.View style={{ opacity: buttonFadeAnim, transform: [{ scale: buttonScaleAnim }] }}>
              <TouchableOpacity style={styles.button} onPress={handleButtonPress}>
                <Text style={styles.buttonText}>I am</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {isInputVisible && (
            <Animated.View style={{ opacity: continueButtonFadeAnim }}>
              <TouchableOpacity 
                style={[styles.button, !name.trim() && styles.disabledButton]} 
                onPress={handleContinue}
                disabled={!name.trim()}
              >
                <Text style={styles.buttonText}>Continue</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
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
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 44,
  },
  footer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
    minHeight: 150, 
    justifyContent: 'flex-end'
  },
  button: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 30,
  },
  buttonText: {
    color: '#0E0E0E',
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputContainer: {
    width: '100%',
    marginTop: 40, // Add space between title and input
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 15,
    fontSize: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  disabledButton: {
    backgroundColor: '#A9A9A9',
  },
});
