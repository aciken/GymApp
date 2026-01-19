import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, Image, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useOnboardingContext } from '../context/OnboardingContext';

const { width } = Dimensions.get('window');

const QUESTIONS = [
  {
    key: 'why1',
    title: 'What’s the main reason you want to boost testosterone?',
    options: ['More energy daily', 'Build lean muscle', 'Feel confident', 'Higher libido'],
  },
  {
    key: 'why2',
    title: 'What’s holding you back the most right now?',
    options: ['Low motivation', 'Low drive / libido', 'Low energy', 'Slow progress'],
  },
  {
    key: 'why3',
    title: 'If this works, what would matter most to you?',
    options: ['Look better', 'Perform better', 'Feel in control', 'More confidence'],
  },
];

export default function WhyTestosterone() {
  const router = useRouter();
  const { saveAnswer } = useOnboardingContext();

  const [step, setStep] = useState(0);
  const [locked, setLocked] = useState(false);

  const trackWidth = useMemo(() => Math.min(320, width - 80), []);
  const rocketX = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const rocketJumpY = useRef(new Animated.Value(0)).current;
  const rocketBob = useRef(new Animated.Value(0)).current;
  const rocketScale = useRef(new Animated.Value(1)).current;
  const rocketWiggle = useRef(new Animated.Value(0)).current;

  // Step enter animations (simple: animate the whole block to avoid glitches)
  const qOpacity = useRef(new Animated.Value(0)).current;
  const qY = useRef(new Animated.Value(14)).current;

  const segment = trackWidth / (QUESTIONS.length - 1);

  const resetStepAnimations = useCallback(() => {
    qOpacity.setValue(0);
    qY.setValue(14);
  }, [qOpacity, qY]);

  const playStepEnter = useCallback(() => {
    Animated.parallel([
      Animated.timing(qOpacity, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(qY, {
        toValue: 0,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [qOpacity, qY]);

  const playStepExit = useCallback(() => {
    // Exit the current step first to prevent flicker/glitches on content swap
    return new Promise((resolve) => {
      Animated.parallel([
        Animated.timing(qOpacity, {
          toValue: 0,
          duration: 180,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(qY, {
          toValue: -6,
          duration: 180,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => resolve());
    });
  }, [qOpacity, qY]);

  useEffect(() => {
    // Idle bob (subtle, continuous)
    const bobLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(rocketBob, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(rocketBob, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    bobLoop.start();
    return () => bobLoop.stop();
  }, [rocketBob]);

  useEffect(() => {
    // Boost forward: overshoot + settle, with a small hop and wiggle
    rocketScale.setValue(1);
    rocketWiggle.setValue(0);
    rocketJumpY.setValue(0);

    const move = Animated.sequence([
      Animated.timing(rocketWiggle, { toValue: 1, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(rocketWiggle, { toValue: 0, duration: 320, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]);

    const hop = Animated.sequence([
      Animated.timing(rocketJumpY, { toValue: -5, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(rocketJumpY, { toValue: 0, stiffness: 200, damping: 20, mass: 0.9, useNativeDriver: true }),
    ]);

    const scale = Animated.sequence([
      Animated.timing(rocketScale, { toValue: 1.06, duration: 200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(rocketScale, { toValue: 1, stiffness: 200, damping: 20, mass: 0.9, useNativeDriver: true }),
    ]);

    Animated.parallel([
      Animated.spring(rocketX, {
        toValue: step * segment,
        stiffness: 170,
        damping: 22,
        mass: 1.0,
        useNativeDriver: true,
      }),
      // Progress bar width can't be driven by the native driver.
      // Keep this separate so the bar animates smoothly while the rocket moves.
      Animated.timing(progressAnim, {
        toValue: step / (QUESTIONS.length - 1),
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
      move,
      hop,
      scale,
    ]).start();
  }, [step, segment, rocketX, rocketJumpY, rocketScale, rocketWiggle, progressAnim]);

  useEffect(() => {
    // Initial enter (and any time step is set externally)
    resetStepAnimations();
    const raf = requestAnimationFrame(() => playStepEnter());
    return () => cancelAnimationFrame(raf);
  }, [step, resetStepAnimations, playStepEnter]);

  const onPick = async (option) => {
    if (locked) return;
    setLocked(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    try {
      saveAnswer?.(QUESTIONS[step].key, option);
    } catch (e) {
      // non-fatal
      console.error('Failed to save onboarding answer:', e);
    }

    if (step < QUESTIONS.length - 1) {
      await playStepExit();
      // Prepare next step to render already hidden (prevents a 1-frame flash)
      resetStepAnimations();
      setStep((s) => s + 1);
      setLocked(false);
    } else {
      await playStepExit();
      router.push('/onboarding/intro');
    }
  };

  const onBack = () => {
    if (locked) return;
    Haptics.selectionAsync().catch(() => {});
    if (step === 0) {
      router.back();
      return;
    }
    // Smooth back transition too
    (async () => {
      setLocked(true);
      await playStepExit();
      resetStepAnimations();
      setStep((s) => Math.max(0, s - 1));
      setLocked(false);
    })();
  };

  const progressFill = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  const bobY = rocketBob.interpolate({
    inputRange: [0, 1],
    outputRange: [-1.5, 1.5],
  });

  const rocketTranslateY = Animated.add(rocketJumpY, bobY);

  // Combine base 90deg rotation + wiggle into a SINGLE rotate transform
  // (RN can crash if you provide two separate `rotate` keys in the same transform array)
  const rocketRotateDeg = rocketWiggle.interpolate({
    inputRange: [0, 1],
    outputRange: ['90deg', '96deg'],
  });

  return (
    <LinearGradient
      colors={['#0A0A0D', '#2B180A', '#000000']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.kicker}>QUICK QUESTIONS</Text>

          <Animated.View style={{ opacity: qOpacity, transform: [{ translateY: qY }] }}>
            <Text style={styles.title}>{QUESTIONS[step].title}</Text>
          </Animated.View>

          {/* Rocket + progress stay in the same position as before (under the title),
              but are NOT affected by the question/answer transition animation. */}
          <View style={styles.progressWrap}>
            <View style={[styles.track, { width: trackWidth }]}>
              <Animated.View style={[styles.trackFill, { width: progressFill }]} />
            </View>

            <View style={[styles.dotsRow, { width: trackWidth }]}>
              {QUESTIONS.map((_, i) => (
                <View key={i} style={[styles.dot, i <= step && styles.dotActive]} />
              ))}
            </View>

            <Animated.View
              style={[
                styles.rocketWrap,
                {
                  transform: [
                    { translateX: rocketX },
                    { translateY: rocketTranslateY },
                    { scale: rocketScale },
                  ],
                },
              ]}
            >
              <Animated.Image
                source={require('../../assets/RocketWhite.png')}
                style={[styles.rocket, { transform: [{ rotate: rocketRotateDeg }] }]}
                resizeMode="contain"
              />
            </Animated.View>
          </View>

          <Animated.View style={{ opacity: qOpacity, transform: [{ translateY: qY }] }}>

            <View style={styles.options}>
              {QUESTIONS[step].options.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.optionBtn, locked && styles.optionBtnDisabled]}
                  activeOpacity={0.9}
                  disabled={locked}
                  onPress={() => onPick(opt)}
                >
                  <Text style={styles.optionText}>{opt}</Text>
                  <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.65)" />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.helper}>Tap an answer to continue</Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 10 },
  backButton: { padding: 10, alignSelf: 'flex-start' },

  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 24 },
  kicker: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2.2,
    textAlign: 'center',
    marginBottom: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 22,
  },

  progressWrap: { alignItems: 'center', marginBottom: 26, paddingTop: 6 },
  track: {
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  trackFill: { height: '100%', backgroundColor: '#FFA500' },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  dotActive: { backgroundColor: 'rgba(255,165,0,0.95)' },
  rocketWrap: {
    position: 'absolute',
    top: -24,
    left: -14, // center rocket over start
  },
  rocket: {
    width: 34,
    height: 34,
    tintColor: '#FFA500',
  },

  options: { gap: 12 },
  optionBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionBtnDisabled: { opacity: 0.55 },
  optionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  helper: {
    marginTop: 16,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    fontWeight: '600',
  },
});


