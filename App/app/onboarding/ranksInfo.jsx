import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image, Dimensions, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const ranks = [
  { name: 'Bronze', minScore: 250, image: require('../../assets/BronzeRank.png'), color: '#E6A66A', desc: 'The beginning of the journey.' },
  { name: 'Silver', minScore: 351, image: require('../../assets/SilverRank.png'), color: '#C0C0C0', desc: 'Building momentum.' },
  { name: 'Gold', minScore: 601, image: require('../../assets/GoldRank.png'), color: '#FFD700', desc: 'Peak performance unlocking.' },
  { name: 'Diamond', minScore: 751, image: require('../../assets/DiamondRank.png'), color: '#E5E4E2', desc: 'Elite status achieved.' },
  { name: 'Champion', minScore: 901, image: require('../../assets/ChampionRank.png'), color: '#FF4136', desc: 'Legendary testosterone levels.' },
];

const RankItem = ({ rank, delay, isLast }) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 800, delay, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, delay, useNativeDriver: true })
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.rankItem, { transform: [{ translateY: slideAnim }], opacity: fadeAnim }]}>
      <View style={styles.leftColumn}>
        <View style={[styles.rankIconContainer, { shadowColor: rank.color }]}>
            <LinearGradient colors={['#252525', '#101010']} style={styles.rankIconCircle}>
                <Image source={rank.image} style={styles.rankImage} />
            </LinearGradient>
            <View style={[styles.rankBorderRing, { borderColor: rank.color }]} />
        </View>
        {!isLast && <View style={styles.timelineLine} />}
      </View>
      
      <View style={styles.rightColumn}>
        <LinearGradient
            colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)']}
            style={[styles.rankCard, { borderColor: 'rgba(255,255,255,0.08)' }]}
        >
            <LinearGradient 
                colors={['rgba(255,255,255,0.05)', 'transparent']} 
                style={styles.rankGlow} 
            />
            <View style={styles.rankHeader}>
                <Text style={[styles.rankName, { color: rank.color }]}>{rank.name.toUpperCase()}</Text>
                <View style={[styles.scoreBadge, { backgroundColor: 'rgba(0,0,0,0.4)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 }]}>
                    <Text style={styles.rankScore}>{rank.minScore}+ ng/dL</Text>
                </View>
            </View>
            <Text style={styles.rankDesc}>{rank.desc}</Text>
        </LinearGradient>
      </View>
    </Animated.View>
  );
};

export default function RanksInfo() {
  const router = useRouter();
  const buttonFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const totalAnimationTime = ranks.length * 150 + 400;
    Animated.timing(buttonFadeAnim, { toValue: 1, duration: 600, delay: totalAnimationTime, useNativeDriver: true }).start();
  }, []);

  return (
    <LinearGradient colors={['#050505', '#000000']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>RANK SYSTEM</Text>
          <Text style={styles.headerSubtitle}>Unlock higher tiers as you improve.</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.ranksWrapper}>
            {ranks.map((rank, index) => (
              <RankItem key={rank.name} rank={rank} delay={index * 120} isLast={index === ranks.length - 1} />
            ))}
          </View>
        </ScrollView>

        <Animated.View style={[styles.footer, { opacity: buttonFadeAnim }]}>
          <TouchableOpacity
            style={styles.buttonWrapper}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/onboarding/rankCharacters');
            }}
          >
            <LinearGradient colors={['#FFC300', '#FF8C00']} style={styles.continueButton}>
              <Text style={styles.continueButtonText}>CONTINUE</Text>
              <Ionicons name="arrow-forward" size={20} color="#000" style={{ marginLeft: 8 }} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: { alignItems: 'center', paddingTop: 20, paddingBottom: 15, paddingHorizontal: 20 },
  headerTitle: { color: '#FFFFFF', fontSize: 28, fontWeight: '900', letterSpacing: 1, textAlign: 'center' },
  headerSubtitle: { color: '#888', fontSize: 15, marginTop: 8, textAlign: 'center', fontWeight: '500' },
  
  scrollContent: { paddingBottom: 120, paddingTop: 5 },
  ranksWrapper: { paddingHorizontal: 20 },
  
  rankItem: { flexDirection: 'row', marginBottom: 0, minHeight: 100 },
  leftColumn: { alignItems: 'center', width: 80, marginRight: 15 },
  rightColumn: { flex: 1, paddingBottom: 20 },
  
  rankIconContainer: {
    width: 70, height: 70,
    justifyContent: 'center', alignItems: 'center',
    borderRadius: 35,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
    zIndex: 2,
    backgroundColor: '#000', // To hide timeline line behind
  },
  rankIconCircle: {
    width: 70, height: 70, borderRadius: 35,
    justifyContent: 'center', alignItems: 'center',
  },
  rankBorderRing: {
    position: 'absolute',
    width: 74, height: 74, borderRadius: 37,
    borderWidth: 2,
    opacity: 0.8,
  },
  rankImage: { width: 50, height: 50, resizeMode: 'contain' },
  
  timelineLine: {
    position: 'absolute',
    top: 70, bottom: 0,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    zIndex: 1,
  },
  
  rankCard: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  rankGlow: {
    position: 'absolute',
    top: 0, left: 0, right: 0, height: 40,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  rankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rankName: { fontSize: 20, fontWeight: '900', letterSpacing: 0.5, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 },
  scoreBadge: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 12,
  },
  rankScore: { color: '#EEE', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  rankDesc: { color: '#BBB', fontSize: 14, lineHeight: 20, fontWeight: '500' },
  
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 30,
    paddingBottom: 40,
    alignItems: 'center',
    backgroundColor: 'transparent', // Let gradient show through or add a fade overlay if needed
  },
  buttonWrapper: {
    width: '100%',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  continueButton: {
    flexDirection: 'row',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  continueButtonText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
});
