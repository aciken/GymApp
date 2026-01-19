import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Easing, Modal, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Svg, Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useOnboardingContext } from '../context/OnboardingContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const REWARD_DELAY_MS = 2500;

const BenefitItem = ({ text }) => (
  <View style={styles.benefitItem}>
    <Ionicons name="checkmark-circle" size={24} color="#FFA500" />
    <Text style={styles.benefitText}>{text}</Text>
  </View>
);

const ProgramGraph = ({ currentT, potentialT }) => (
  <View style={styles.graphContainer}>
    <Text style={styles.graphTitle}>Your Testosterone Journey</Text>
    
    <View style={styles.statsContainer}>
      <View style={styles.statBox}>
        <Text style={styles.statLabel}>Current</Text>
        <Text style={styles.statValue}>{currentT} ng/dL</Text>
      </View>
      <Ionicons name="arrow-forward" size={20} color="#666" style={{ marginTop: 20 }} />
      <View style={styles.statBox}>
        <Text style={styles.statLabel}>Potential</Text>
        <Text style={[styles.statValue, { color: '#FFA500' }]}>{potentialT} ng/dL</Text>
      </View>
    </View>

    <View style={{ height: 100, alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
      <Svg height="100%" width="100%" viewBox="0 0 100 50">
        <Defs>
          <SvgGradient id="grad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#FFA500" stopOpacity="0.5" />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity="1" />
          </SvgGradient>
        </Defs>
        <Path 
          d="M 0 40 Q 25 5, 50 20 T 100 10" 
          fill="none" 
          stroke="url(#grad)" 
          strokeWidth="3" 
          strokeLinecap="round"
        />
        {/* Glowing dot at the end */}
        <Path d="M 99 10 A 1 1 0 0 1 99 10" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="4" strokeOpacity="0.5" />
      </Svg>
    </View>
  </View>
);

export default function ProgramPreview() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { score, setScore } = useOnboardingContext();
  const [currentScore, setCurrentScore] = useState(score);
  const hasTriggeredRef = useRef(false);
  const [showRewardTransition, setShowRewardTransition] = useState(false);
  const rewardCardScale = useRef(new Animated.Value(1)).current;
  const rewardCardY = useRef(new Animated.Value(0)).current;
  const rewardProgress = useRef(new Animated.Value(0)).current;
  
  // Load persisted score if context is lost (e.g. app restart)
  useEffect(() => {
    const loadScore = async () => {
      if (score > 0) {
        setCurrentScore(score);
        return;
      }

      try {
        const savedScore = await AsyncStorage.getItem('onboarding_score');
        if (savedScore) {
          const parsed = parseFloat(savedScore);
          if (!isNaN(parsed) && parsed > 0) {
            setCurrentScore(parsed);
            if (setScore) setScore(parsed);
          }
        }
      } catch (e) {
        console.error("Failed to load score", e);
      }
    };
    loadScore();
  }, [score]);

  // Robust trigger for opening RewardWheel after closing paywall:
  // - Primary: AsyncStorage flag set by Paywall.jsx (reliable even with replace()).
  // - Secondary: triggerWheel param (kept for backwards compatibility).
  useFocusEffect(
    useCallback(() => {
      let timer;
      let cancelled = false;

      const maybeOpenWheel = async () => {
        try {
          const storageFlag = await AsyncStorage.getItem('open_reward_wheel');
          const paramFlag = params?.triggerWheel === 'true' || params?.triggerWheel === true;

          if ((storageFlag === '1' || paramFlag) && !hasTriggeredRef.current) {
            hasTriggeredRef.current = true;
            setShowRewardTransition(true);

            // Clear the flag immediately so it doesn't loop on future focuses.
            await AsyncStorage.removeItem('open_reward_wheel');
            await AsyncStorage.removeItem('open_reward_wheel_ts');

            timer = setTimeout(() => {
              if (!cancelled) {
                setShowRewardTransition(false);
                router.push('/onboarding/rewardWheel');
              }
            }, REWARD_DELAY_MS);
          }
        } catch (e) {
          console.error('ProgramPreview: failed to read open_reward_wheel flag:', e);
        }
      };

      maybeOpenWheel();

      return () => {
        cancelled = true;
        if (timer) clearTimeout(timer);
        setShowRewardTransition(false);
      };
    }, [params?.triggerWheel, router])
  );

  useEffect(() => {
    if (!showRewardTransition) {
      rewardCardScale.setValue(1);
      rewardCardY.setValue(0);
      rewardProgress.setValue(0);
      return;
    }

    // Simple + clean: quick pop-in and a subtle lift.
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    rewardCardScale.setValue(0.92);
    rewardCardY.setValue(10);
    rewardProgress.setValue(0);

    Animated.parallel([
      Animated.spring(rewardCardScale, {
        toValue: 1,
        stiffness: 240,
        damping: 18,
        mass: 0.7,
        useNativeDriver: true,
      }),
      Animated.spring(rewardCardY, {
        toValue: 0,
        stiffness: 220,
        damping: 20,
        mass: 0.7,
        useNativeDriver: true,
      }),
    ]).start();

    // Progress bar fills over the same delay as the navigation.
    Animated.timing(rewardProgress, {
      toValue: 1,
      duration: REWARD_DELAY_MS,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [showRewardTransition, rewardCardScale, rewardCardY, rewardProgress]);

  const currentT = Math.round(currentScore * 10);
  // Calculate potential: cap at 1000 or 2.2x current, whichever is reasonable, 
  // ensuring it's always higher than current. 
  // Using similar logic to results page: Math.min(score * 2.2, 100) * 10 => max 1000
  const potentialT = Math.round(Math.min(currentT * 2.2, 1000));

  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + 90);
  const formattedDate = completionDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <LinearGradient colors={['#2A1A0A', '#1A1108', '#000000']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Image
            source={require('../../assets/RocketWhite.png')}
            style={styles.boostLogo}
            resizeMode="contain"
          />
          
          <Text style={styles.mainTitle}>In just 90 days, you'll take your first real step toward becoming a real man.</Text>
          <Text style={styles.subtitle}>Your journey to true manhood begins now. These are the milestones that await you:</Text>

          <View style={styles.dateChip}>
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>

          <BenefitItem text="Your physical strength will drastically improve" />
          <BenefitItem text="Your endurance and discipline will be 3x stronger" />
          <BenefitItem text="You will feel more motivated and energized than ever" />
          <BenefitItem text="Your dopamine reward system will be refreshed" />

          <ProgramGraph currentT={currentT} potentialT={potentialT} />

        </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.continueButton} 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/utils/Paywall');
            }}
          >
            <LinearGradient colors={['#FFC300', '#FF8C00']} style={styles.buttonGradient}>
              <Text style={styles.continueButtonText}>Start My Program</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Modal visible={showRewardTransition} transparent animationType="fade">
          <View style={styles.rewardOverlay}>
            <Animated.View
              style={[
                styles.rewardCard,
                {
                  transform: [{ translateY: rewardCardY }, { scale: rewardCardScale }],
                },
              ]}
            >
              <View style={styles.rewardIconBadge}>
                <Ionicons name="gift" size={26} color="#000" />
              </View>
              <Text style={styles.rewardTitle}>We got a special offer for you</Text>
              <Text style={styles.rewardSub}>Loading your spin…</Text>
              <View style={styles.rewardSpinnerRow}>
                <View style={styles.rewardProgressTrack}>
                  <Animated.View
                    style={[
                      styles.rewardProgressFill,
                      {
                        width: rewardProgress.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      },
                    ]}
                  />
                </View>
              </View>
            </Animated.View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 120 },
  mainIcon: {
    textAlign: 'center',
    marginBottom: 20,
  },
  boostLogo: {
    width: 64,
    height: 64,
    alignSelf: 'center',
    marginBottom: 18,
    tintColor: '#FFA500',
  },
  mainTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  subtitle: {
    color: '#D3D3D3',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  dateChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  benefitText: {
    color: '#E0E0E0',
    fontSize: 17,
    marginLeft: 12,
    flex: 1,
    lineHeight: 24,
  },
  graphContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  graphTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
  },
  continueButton: {
    borderRadius: 30,
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 30,
  },
  continueButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Reward transition overlay (shown for 3s after closing paywall)
  rewardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  rewardCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: 'rgba(20, 16, 10, 0.92)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 195, 0, 0.18)',
    paddingVertical: 22,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#FFC300',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 18,
  },
  rewardIconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFC300',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFC300',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
    marginBottom: 14,
  },
  rewardTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 0,
    textAlign: 'center',
  },
  rewardSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  rewardSpinnerRow: {
    marginTop: 14,
    width: '100%',
  },
  rewardProgressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  rewardProgressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#FFC300',
  },
});
