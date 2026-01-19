import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useOnboardingContext } from '../context/OnboardingContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Animated LinearGradient 
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const calculateScore = (answers) => {
  let totalScore = 0;
  
  // Q1: Age
  switch(answers[1]) {
    case 'Under 18': totalScore += 40; break;
    case '18-24': totalScore += 50; break;
    case '25-34': totalScore += 45; break;
    case '35-44': totalScore += 35; break;
    case '45+': totalScore += 25; break;
    default: totalScore += 40;
  }

  // Q2: Sleep
  switch(answers[2]) {
    case 'Less than 5 hours': totalScore += 10; break;
    case '5-7 hours': totalScore += 25; break;
    case '7-8 hours': totalScore += 40; break;
    case 'More than 8 hours': totalScore += 45; break;
    default: totalScore += 25;
  }

  // Q3: Diet
  switch(answers[3]) {
    case 'High in processed foods': totalScore += 10; break;
    case 'Balanced': totalScore += 30; break;
    case 'High protein': totalScore += 40; break;
    case 'Vegetarian/Vegan': totalScore += 25; break;
    default: totalScore += 30;
  }

  // Q4: Masturbation
  switch(answers[4]) {
    case 'Multiple times a day': totalScore += 15; break;
    case 'Daily': totalScore += 20; break;
    case 'A few times a week': totalScore += 30; break;
    case 'Rarely or never': totalScore += 35; break;
    default: totalScore += 20;
  }

  // Q5: Exercise (general)
  switch(answers[5]) {
    case 'Yes, regularly': totalScore += 40; break;
    case 'Yes, occasionally': totalScore += 25; break;
    case 'No, but I want to': totalScore += 15; break;
    case 'No': totalScore += 10; break;
    default: totalScore += 15;
  }

  // Q6: Exercise Type
  switch(answers[6]) {
    case 'Cardio (running, cycling)': totalScore += 30; break;
    case 'Weightlifting': totalScore += 45; break;
    case 'Team sports': totalScore += 35; break;
    case "I don't exercise": totalScore += 10; break;
    default: totalScore += 10;
  }

  // Q7: Muscle
  switch(answers[7]) {
    case "Yes, it's very difficult": totalScore += 15; break;
    case "It's a bit of a struggle": totalScore += 25; break;
    case "No, it's relatively easy": totalScore += 40; break;
    case "I haven't tried": totalScore += 20; break;
    default: totalScore += 25;
  }

  // Q8: Erection
  switch(answers[8]) {
    case 'Almost every morning': totalScore += 45; break;
    case 'Sometimes': totalScore += 30; break;
    case 'Rarely': totalScore += 20; break;
    case 'Never': totalScore += 10; break;
    default: totalScore += 30;
  }

  // Q9: Body Hair
  switch(answers[9]) {
    case 'Yes, a lot': totalScore += 40; break;
    case 'Average amount': totalScore += 30; break;
    case 'Less than average': totalScore += 20; break;
    case 'Very little': totalScore += 15; break;
    default: totalScore += 30;
  }

  // Q10: Hairline
  switch(answers[10]) {
    case 'Yes, significantly': totalScore += 35; break;
    case 'Yes, slightly': totalScore += 30; break;
    case "No, it's stable": totalScore += 30; break;
    case "It's fuller than before": totalScore += 25; break;
    default: totalScore += 30;
  }

  // Q11: Mood Swings
  switch(answers[11]) {
    case 'Yes, very frequently': totalScore += 10; break;
    case 'Sometimes': totalScore += 20; break;
    case 'Rarely': totalScore += 35; break;
    case 'Almost never': totalScore += 40; break;
    default: totalScore += 20;
  }

  // Q12: Energy
  switch(answers[12]) {
    case 'Almost every day': totalScore += 10; break;
    case 'A few times a week': totalScore += 20; break;
    case 'Occasionally': totalScore += 30; break;
    case 'Rarely': totalScore += 40; break;
    default: totalScore += 20;
  }

  // Q13: Alcohol
  switch(answers[13]) {
    case 'Almost every day': totalScore += 10; break;
    case 'A few times a week': totalScore += 20; break;
    case 'Occasionally': totalScore += 30; break;
    case 'Rarely or never': totalScore += 40; break;
    default: totalScore += 20;
  }

  // Total min ~175, max ~530
  // We want output between 20 and 50 (representing 200-500 ng/dl)
  
  let finalScore = 20 + (totalScore - 175) * 0.0845;
  
  // Clamp values
  if (finalScore < 20) finalScore = 20;
  if (finalScore > 50) finalScore = 50;

  return Math.round(finalScore);
};

export default function Results() {
  const router = useRouter();
  const { answers, setScore } = useOnboardingContext();
  const [userScore, setUserScore] = useState(29);
  const [step, setStep] = useState(1); // 1 = Analysis, 2 = Potential
  const averageScore = 50;
  
  // Refs for animations
  const userHeightAnim = useRef(new Animated.Value(0)).current;
  const averageHeightAnim = useRef(new Animated.Value(0)).current;
  const potentialHeightAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const contentScaleAnim = useRef(new Animated.Value(1)).current;
  // Ref for background color interpolation
  const backgroundAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const score = calculateScore(answers);
    setUserScore(score);
    if (setScore) setScore(score); // Save to context
    AsyncStorage.setItem('onboarding_score', score.toString()); // Save to persistence

    // Initial animation for step 1
    Animated.parallel([
      Animated.timing(averageHeightAnim, {
        toValue: averageScore / 100,
        duration: 1500,
        useNativeDriver: false,
        easing: Easing.out(Easing.back(1.2)),
      }),
      Animated.timing(userHeightAnim, {
        toValue: score / 100,
        duration: 3000,
        useNativeDriver: false,
        easing: Easing.out(Easing.back(1.2)),
        delay: 500,
      }),
    ]).start();
  }, [answers]);

  const handleContinue = () => {
    if (step === 1) {
      // Step 1 -> Step 2 Transition
      const projectedScore = Math.min(userScore * 2.2, 100); 

      // 1. Fade out and scale down slightly
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(contentScaleAnim, {
          toValue: 0.95,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(averageHeightAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        })
      ]).start(() => {
        // 2. Switch state and animate in
        setStep(2);
        
        Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
              easing: Easing.out(Easing.cubic),
            }),
            Animated.timing(contentScaleAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
                easing: Easing.out(Easing.back(1.5)),
            }),
            Animated.timing(potentialHeightAnim, {
              toValue: projectedScore / 100,
              duration: 2000,
              useNativeDriver: false,
              easing: Easing.out(Easing.cubic),
            }),
            // Animate background color change
            Animated.timing(backgroundAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: false,
            })
        ]).start();
      });

    } else {
      // Navigate to next screen
      router.replace('/onboarding/transformLife');
    }
  };

  const animatedUserHeight = userHeightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const animatedAverageHeight = averageHeightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const animatedPotentialHeight = potentialHeightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // Derived values
  const projectedScore = Math.min(userScore * 2.2, 100);

  return (
    <View style={styles.container}>
        {/* Background Gradient Layer 1 (Redish) */}
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: backgroundAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]}>
            <LinearGradient colors={['#1a0506', '#000000']} style={StyleSheet.absoluteFill} />
        </Animated.View>

        {/* Background Gradient Layer 2 (Orangish) */}
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: backgroundAnim }]}>
            <LinearGradient colors={['#1a0f05', '#000000']} style={StyleSheet.absoluteFill} />
        </Animated.View>

      <SafeAreaView style={styles.safeArea}>
        
        {/* HEADER */}
        <View style={styles.headerContainer}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: contentScaleAnim }], width: '100%', alignItems: 'center' }}>
            {step === 1 ? (
              <>
                <Text style={styles.title}>Analysis Complete</Text>
                <Text style={styles.subtitle}>
                  We've analyzed your lifestyle habits to estimate your testosterone levels.
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.label}>YOUR POTENTIAL</Text>
                <Text style={styles.mainTitle}>90 DAY GOAL</Text>
              </>
            )}
          </Animated.View>
        </View>

        {/* CHART SECTION */}
        <View style={styles.chartSection}>
          <Animated.View style={[styles.chartContainer, { transform: [{ scale: contentScaleAnim }] }]}>
            
            {/* Left Bar: User Score */}
            <View style={styles.barWrapper}>
              <View style={styles.barTrack}>
                <Animated.View style={[styles.barFill, { height: animatedUserHeight, backgroundColor: '#DC2626' }]}>
                   <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.gradientFill} />
                </Animated.View>
              </View>
              <Text style={styles.barLabel}>{step === 2 ? "CURRENT" : "YOU"}</Text>
              <Text style={styles.barValue}>{`${userScore * 10} ng/dl`}</Text>
            </View>

            {/* Middle Element */}
            <View style={styles.middleContainer}>
                {step === 2 ? (
                    <Animated.View style={{ opacity: fadeAnim }}>
                        <Ionicons name="arrow-forward" size={28} color="#4B5563" />
                    </Animated.View>
                ) : (
                    <View style={styles.dividerLine} />
                )}
            </View>

            {/* Right Bar: Average / Potential */}
            <View style={styles.barWrapper}>
              <View style={styles.barTrack}>
                {/* Average Bar */}
                <Animated.View style={[
                    styles.barFill, 
                    { 
                        height: animatedAverageHeight, 
                        position: 'absolute', 
                        bottom: 0, 
                        zIndex: step === 1 ? 1 : 0,
                        opacity: step === 1 ? 1 : 0
                    }
                ]}>
                    <LinearGradient colors={['#9CA3AF', '#6B7280']} style={styles.gradientFill} />
                </Animated.View>

                {/* Potential Bar */}
                <Animated.View style={[
                    styles.barFill, 
                    { 
                        height: animatedPotentialHeight,
                        position: 'absolute',
                        bottom: 0,
                        zIndex: step === 2 ? 1 : 0,
                        opacity: step === 2 ? 1 : 0
                    }
                ]}>
                    <LinearGradient colors={['#F59E0B', '#B45309']} style={styles.gradientFill} />
                </Animated.View>
              </View>

              <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
                <Text style={[styles.barLabel, step === 2 && styles.goldText]}>
                    {step === 1 ? "AVERAGE" : "POTENTIAL"}
                </Text>
                <Text style={[styles.barValue, step === 2 && styles.goldText]}>
                    {step === 1 ? `${averageScore * 10} ng/dl` : `${Math.round(projectedScore * 10)} ng/dl`}
                </Text>
              </Animated.View>
            </View>
          </Animated.View>
        </View>

        {/* DESCRIPTION TEXT */}
        <View style={styles.textContainer}>
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
                {step === 1 ? (
                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                        Your estimated levels are <Text style={[styles.bold, { color: userScore > averageScore ? '#34D399' : '#F87171' }]}>
                            {userScore > averageScore ? `${userScore - averageScore}% above` : `${averageScore - userScore}% below`}
                        </Text> the average for your age group.
                    </Text>
                </View>
                ) : (
                <Text style={styles.impactText}>
                    With the right protocol, you can <Text style={styles.highlight}>optimize</Text> your biology and reach peak male performance.
                </Text>
                )}
            </Animated.View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.button} onPress={handleContinue} activeOpacity={0.8}>
            <LinearGradient
                colors={['#FFFFFF', '#E5E7EB']}
                style={styles.buttonGradient}
            >
                <Text style={styles.buttonText}>
                {step === 1 ? "Analyze Potential" : "See How"}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#000" style={{ marginLeft: 8 }} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Fallback color
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 24,
    height: 120, 
    justifyContent: 'center',
  },
  badgeContainer: {
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    padding: 12,
    borderRadius: 50,
    marginBottom: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  label: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  mainTitle: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
  },
  chartSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: '100%',
    height: 380,
    paddingHorizontal: 20,
  },
  barWrapper: {
    alignItems: 'center',
    width: 100,
  },
  barTrack: {
    width: 60,
    height: 300,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  barFill: {
    width: '100%',
    borderRadius: 12,
  },
  gradientFill: {
    flex: 1,
    borderRadius: 12,
  },
  middleContainer: {
    width: 60,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  dividerLine: {
    width: 1,
    height: '60%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  barLabel: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 1,
  },
  barValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  goldText: {
    color: '#F59E0B',
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  textContainer: {
    paddingHorizontal: 30,
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoText: {
    color: '#D1D5DB',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  impactText: {
    color: '#FFFFFF',
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 30,
  },
  highlight: {
    color: '#F59E0B',
    fontWeight: 'bold',
  },
  bold: {
    fontWeight: 'bold',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  button: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 30,
  },
  buttonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
