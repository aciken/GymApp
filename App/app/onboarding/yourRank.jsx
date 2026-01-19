import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboardingContext } from '../context/OnboardingContext';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ranksData = [
  { name: 'Bronze', minScore: 0, maxScore: 350, characterImage: require('../../assets/BroneGuy.png'), badgeImage: require('../../assets/BronzeRank.png'), color: '#E6A66A', accent: '#8B4513' },
  { name: 'Silver', minScore: 351, maxScore: 600, characterImage: require('../../assets/SilverGuy.png'), badgeImage: require('../../assets/SilverRank.png'), color: '#E0E0E0', accent: '#708090' },
  { name: 'Gold', minScore: 601, maxScore: 750, characterImage: require('../../assets/GoldGuy.png'), badgeImage: require('../../assets/GoldRank.png'), color: '#FFD700', accent: '#B8860B' },
  { name: 'Diamond', minScore: 751, maxScore: 1000, characterImage: require('../../assets/DiamondGuy.png'), badgeImage: require('../../assets/DiamondRank.png'), color: '#B9F2FF', accent: '#4682B4' },
];

export default function YourRank() {
  const router = useRouter();
  const { score } = useOnboardingContext();
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const badgeRotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Calculate actual score in ng/dl
  const actualScore = (score || 29) * 10;

  // Determine rank
  let currentRankIndex = 0;
  for (let i = ranksData.length - 1; i >= 0; i--) {
    if (actualScore >= ranksData[i].minScore) {
      currentRankIndex = i;
      break;
    }
  }
  
  const currentRank = ranksData[currentRankIndex];
  const nextRank = ranksData[currentRankIndex + 1];
  
  // Calculate progress to next rank
  let progress = 0;
  let pointsNeeded = 0;
  
  if (nextRank) {
    const range = currentRank.maxScore - currentRank.minScore;
    const currentProgress = actualScore - currentRank.minScore;
    progress = Math.min(Math.max(currentProgress / range, 0), 1);
    pointsNeeded = Math.round(nextRank.minScore - actualScore);
  } else {
    progress = 1;
  }

  useEffect(() => {
    // Entrance sequence
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 1500,
        delay: 800,
        useNativeDriver: false, // Width animation not supported by native driver
      }),
    ]).start();

    // Continuous badge rotation effect (subtle sway)
    Animated.loop(
      Animated.sequence([
        Animated.timing(badgeRotateAnim, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(badgeRotateAnim, { toValue: -1, duration: 3000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const badgeRotation = badgeRotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-5deg', '5deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
        <Image 
            source={require('../../assets/Background1.png')} 
            style={styles.backgroundImage}
            blurRadius={5}
        />
        <LinearGradient 
            colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)', '#000000']} 
            style={styles.gradientOverlay} 
        />

      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.subtitle}>BASED ON YOUR LIFESTYLE</Text>
          <Text style={styles.title}>YOU START AS</Text>
        </Animated.View>

        <View style={styles.content}>
          <Animated.View style={[styles.imageContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
             {/* Character */}
             <Image source={currentRank.characterImage} style={styles.characterImage} />
          </Animated.View>

          <Animated.View style={[styles.rankInfo, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={[styles.rankName, { color: currentRank.color, textShadowColor: currentRank.accent }]}>
                {currentRank.name}
            </Text>
            
            <View style={styles.scoreContainer}>
                <Text style={styles.currentScore}>{actualScore}</Text>
                <Text style={styles.scoreLabel}> TESTOSTERONE LEVEL</Text>
            </View>

            {/* Progress Bar to Next Rank */}
            {nextRank && (
                <View style={styles.progressSection}>
                    {/* Rank Icons Row */}
                    <View style={styles.rankRow}>
                        <View style={styles.rankItem}>
                             <Image source={currentRank.badgeImage} style={styles.smallBadge} />
                             <Text style={[styles.rankLabelSmall, { color: currentRank.color }]}>{currentRank.name.toUpperCase()}</Text>
                        </View>
                        
                        {/* Connecting Line/Arrow */}
                        <View style={styles.connector}>
                            <View style={styles.connectorLine} />
                            <Ionicons name="chevron-forward" size={14} color="#666" />
                        </View>

                        <View style={styles.rankItem}>
                             <Image source={nextRank.badgeImage} style={[styles.smallBadge, { opacity: 0.7 }]} />
                             <Text style={[styles.rankLabelSmall, { color: '#9CA3AF' }]}>{nextRank.name.toUpperCase()}</Text>
                        </View>
                    </View>
                    
                    {/* Bar */}
                    <View style={styles.progressBarContainer}>
                        <View style={styles.progressBarTrack} />
                        <Animated.View style={[styles.progressBarFill, { width: progressWidth, backgroundColor: currentRank.color }]} >
                            <LinearGradient
                                colors={[currentRank.color, currentRank.accent]}
                                start={{x: 0, y: 0}}
                                end={{x: 1, y: 0}}
                                style={StyleSheet.absoluteFill}
                            />
                        </Animated.View>
                    </View>
                    
                    <Text style={styles.xpText}>
                        <Text style={styles.xpValue}>{pointsNeeded}</Text> POINTS TO NEXT LEVEL
                    </Text>
                </View>
            )}
          </Animated.View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => router.push('/onboarding/createAccount')}
            activeOpacity={0.8}
          >
            <LinearGradient
                colors={['#FFFFFF', '#D1D5DB']} // White/Silver gradient
                start={{x: 0, y: 0}} 
                end={{x: 1, y: 1}}
                style={styles.buttonGradient}
            >
                <Text style={styles.buttonText}>Begin Transformation</Text>
                <Ionicons name="arrow-forward" size={20} color="#000" />
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
    backgroundColor: '#000000',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: width,
    height: '100%',
    resizeMode: 'cover',
    opacity: 0.4,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: width * 0.8,
    height: width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginTop: 10,
  },
  characterImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    zIndex: 1,
  },
  rankInfo: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  rankName: {
    fontSize: 48,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: 5,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  currentScore: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
  },
  scoreLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  progressSection: {
    width: '100%',
    backgroundColor: 'rgba(20, 20, 25, 0.8)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 5,
  },
  rankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallBadge: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    marginRight: 8,
  },
  rankLabelSmall: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  connector: {
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.5,
  },
  connectorLine: {
    width: 20,
    height: 1,
    backgroundColor: '#666',
    marginRight: 4,
  },
  progressBarContainer: {
    height: 12,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  progressBarTrack: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  barGlow: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 15,
    backgroundColor: 'rgba(255,255,255,0.6)',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  xpText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  xpValue: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 30,
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
    paddingVertical: 20,
    borderRadius: 30,
  },
  buttonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
});
