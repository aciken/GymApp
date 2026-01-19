import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';

const ranksData = [
  { name: 'Bronze', minScore: 250, characterImage: require('../../assets/BroneGuy.png'), badgeImage: require('../../assets/BronzeRank.png'), color: '#E6A66A' },
  { name: 'Silver', minScore: 351, characterImage: require('../../assets/SilverGuy.png'), badgeImage: require('../../assets/SilverRank.png'), color: '#C0C0C0' },
  { name: 'Gold', minScore: 601, characterImage: require('../../assets/GoldGuy.png'), badgeImage: require('../../assets/GoldRank.png'), color: '#FFD700' },
  { name: 'Diamond', minScore: 751, characterImage: require('../../assets/DiamondGuy.png'), badgeImage: require('../../assets/DiamondRank.png'), color: '#E5E4E2' },
];

const ScoreProgressBar = ({ score, maxScore = 1000 }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (score / maxScore) * 100,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [score]);

  const widthInterpolation = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.progressContainer}>
      <View style={styles.scoreInfoContainer}>
        <Text style={styles.scoreLabel}>REQUIRED TESTOSTERONE</Text>
        <Text style={styles.scoreValue}>{score} ng/dL</Text>
      </View>
      <View style={styles.trackContainer}>
        <Animated.View style={[styles.progressFill, { width: widthInterpolation }]}>
          <LinearGradient
            colors={['#FFC300', '#FF8C00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.progressGradient}
          />
        </Animated.View>
      </View>
    </View>
  );
};

const RankBadge = ({ badgeImage, isActive, index, rankColor }) => {
  const scaleAnim = useRef(new Animated.Value(isActive ? 1.1 : 1)).current;
  const opacityAnim = useRef(new Animated.Value(isActive ? 1 : 0.5)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: isActive ? 1.1 : 1, friction: 5, useNativeDriver: true }).start();
    Animated.timing(opacityAnim, { toValue: isActive ? 1 : 0.5, duration: 300, useNativeDriver: true }).start();
  }, [isActive]);

  const angle = (index - 1.5) * 0.8; // Even more spread
  const y = 120 * Math.sin(angle); // Even more vertical distance
  const x = 20 * Math.cos(angle);

  return (
    <Animated.View style={[styles.badgeContainer, { transform: [{ scale: scaleAnim }, { translateX: x }, { translateY: y }], opacity: opacityAnim }]}>
      <Image source={badgeImage} style={styles.badgeImage} />
      <View style={[styles.badgeHighlight, { opacity: isActive ? 1 : 0, borderColor: rankColor, shadowColor: rankColor }]} />
    </Animated.View>
  );
};

export default function RankCharacters() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const characterAnims = useRef(ranksData.map(() => new Animated.Value(0))).current;
  const standPulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start the stand pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(standPulseAnim, { toValue: 0.8, duration: 1500, useNativeDriver: true }),
        Animated.timing(standPulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    Animated.timing(characterAnims[currentIndex], { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [currentIndex]);

  const cycleRank = (direction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const nextIndex = currentIndex + direction;

    if (nextIndex >= 0 && nextIndex < ranksData.length) {
      Animated.timing(characterAnims[currentIndex], { toValue: 0, duration: 400, useNativeDriver: true }).start();
      setCurrentIndex(nextIndex);
    } else if (direction > 0 && nextIndex >= ranksData.length) {
      router.push('/onboarding/yourRank');
    }
  };

  return (
    <LinearGradient colors={['#2A1A0A', '#1A1108', '#000000']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <BlurView intensity={50} tint="dark" style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Who will you rise to become?</Text>
        </BlurView>

        <View style={styles.content}>
          <View style={styles.characterContainer}>
            <View style={styles.characterWrapper}>
              {ranksData.map((rank, index) => (
                <Animated.Image 
                  key={rank.name} 
                  source={rank.characterImage} 
                  style={[styles.characterImage, { opacity: characterAnims[index] }]} 
                />
              ))}
              <Animated.Image 
                source={require('../../assets/CharacterStand.png')} 
                style={[styles.portalImage, { opacity: standPulseAnim }]} 
              />
            </View>
          </View>

          <View style={styles.badgesColumn}>
            {ranksData.map((rank, index) => (
              <RankBadge key={rank.name} badgeImage={rank.badgeImage} isActive={index === currentIndex} index={index} rankColor={rank.color} />
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <ScoreProgressBar score={ranksData[currentIndex].minScore} />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.navButton} onPress={() => cycleRank(-1)}>
              <Text style={styles.navButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => cycleRank(1)}>
              <LinearGradient colors={['#FFC300', '#FF8C00']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.continueButton}>
                <Text style={styles.continueButtonText}>
                  {currentIndex === ranksData.length - 1 ? "See My Rank" : "Next"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  titleContainer: {
    margin: 20,
    padding: 15,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  content: { flexDirection: 'row', flex: 1, alignItems: 'center' },
  characterContainer: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterWrapper: {
    width: '100%',
    height: '80%',
    position: 'relative',
  },
  characterImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    position: 'absolute',
    bottom: '15%',
    zIndex: 10,
  },
  portalImage: {
    width: '100%',
    height: '50%',
    resizeMode: 'contain',
    position: 'absolute',
    bottom: '-3%',
    zIndex: 1,
  },
  badgesColumn: {
    flex: 1,
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeImage: { width: '100%', height: '100%', resizeMode: 'contain' },
  badgeHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 35,
    borderWidth: 2,
    shadowRadius: 10,
    shadowOpacity: 1,
  },
  footer: {
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  progressContainer: {
    marginBottom: 30,
    width: '100%',
  },
  scoreInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  scoreLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  scoreValue: {
    color: '#FFC300',
    fontSize: 16,
    fontWeight: '800',
    textShadowColor: 'rgba(255, 195, 0, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  trackContainer: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressGradient: {
    flex: 1,
    borderRadius: 3,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 30,
  },
  navButtonText: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 18, fontWeight: 'bold' },
  continueButton: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: '#FF8C00',
    shadowRadius: 10,
    shadowOpacity: 0.5,
  },
  continueButtonText: { color: '#000000', fontSize: 18, fontWeight: 'bold' },
});
