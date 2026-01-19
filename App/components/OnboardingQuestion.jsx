import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import ProgressBar from './ProgressBar';
import { useOnboardingContext } from '../app/context/OnboardingContext';

const TOTAL_QUESTIONS = 13;

const OnboardingQuestion = ({ questionNumber, question, answers, nextPage, isLastQuestion = false }) => {
  const router = useRouter();
  const { saveAnswer } = useOnboardingContext();
  const [selected, setSelected] = useState(null);
  const headerAnim = useRef(new Animated.Value(0)).current;
  const answerAnims = useRef(answers.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      ...answerAnims.map(anim => Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }))
    ];
    Animated.stagger(100, animations).start();
  }, []);

  const handleAnswerSelect = (answer) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelected(answer);
    saveAnswer(questionNumber, answer);
    setTimeout(() => {
      if (isLastQuestion) {
        router.replace('/onboarding/calculating');
      } else {
        router.push(nextPage);
      }
    }, 300);
  };

  const progress = (questionNumber / TOTAL_QUESTIONS) * 100;

  return (
    <LinearGradient
      colors={['#0A0A0D', '#2B180A', '#000000']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1, width: '100%' }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <ProgressBar progress={progress} />
        </View>

        <View style={styles.content}>
          <Animated.View style={{ opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
            <Text style={styles.kicker}>QUESTION {questionNumber}/{TOTAL_QUESTIONS}</Text>
            <Text style={styles.questionText}>{question}</Text>
          </Animated.View>

          <View style={styles.answersContainer}>
            {answers.map((answer, index) => (
              <Animated.View
                key={index}
                style={{
                  opacity: answerAnims[index],
                  transform: [{
                    translateY: answerAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    })
                  }]
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.answerButton,
                    selected === answer && styles.selectedAnswer,
                  ]}
                  onPress={() => handleAnswerSelect(answer)}
                  activeOpacity={0.9}
                >
                  <Text style={styles.answerText}>{answer}</Text>
                  <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.65)" />
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  backButton: {
    padding: 10,
  },
  content: {
    flex: 1,
    width: '100%',
    marginTop: 36,
  },
  kicker: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2.2,
    textAlign: 'center',
    marginBottom: 10,
  },
  questionText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 18,
  },
  answersContainer: {
    width: '100%',
  },
  answerButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    paddingVertical: 20,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedAnswer: {
    borderColor: '#FFA500',
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
    shadowColor: '#FFA500',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  answerText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default OnboardingQuestion;
