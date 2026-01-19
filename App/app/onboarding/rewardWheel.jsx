import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Svg, { Path, G, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

const SECTORS = [
  // Non-winner slices: clean charcoal/graphite palette (no colorful tints).
  { label: '10%', sub: 'OFF', color: '#24262B', textColor: '#E5E7EB', angle: 66 },     // graphite
  { label: 'TRY', sub: 'AGAIN', color: '#1C1E23', textColor: '#CBD5E1', angle: 66 },   // near-black
  { label: '50%', sub: 'OFF', color: '#FF9500', textColor: '#000', isWinner: true, angle: 30 }, // Smallest slice (Gold)
  { label: 'FREE', sub: 'TRIAL', color: '#2A2C31', textColor: '#E5E7EB', angle: 66 }, // charcoal
  { label: '20%', sub: 'OFF', color: '#202228', textColor: '#E5E7EB', angle: 66 },    // graphite
  { label: 'TRY', sub: 'AGAIN', color: '#272A30', textColor: '#CBD5E1', angle: 66 },  // charcoal
];

const CONFETTI_COLORS = ['#FFD700', '#FFA500', '#FF4500', '#FFFFFF', '#4ECDC4'];
const PARTICLE_COUNT = 40;

const ConfettiParticle = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [config] = useState(() => ({
    x: Math.random() * 400 - 200,
    delay: Math.random() * 1000,
    duration: 2500 + Math.random() * 1000,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 6 + Math.random() * 4,
    rotation: Math.random() * 360,
  }));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: config.duration,
          delay: config.delay,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, { toValue: 0, duration: 0, useNativeDriver: true })
      ])
    ).start();
  }, []);

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 800]
  });

  const rotateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const rotateZ = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [`${config.rotation}deg`, `${config.rotation + 360}deg`]
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: -50,
        left: '50%',
        width: config.size,
        height: config.size,
        backgroundColor: config.color,
        borderRadius: config.size > 8 ? 2 : 4,
        transform: [
          { translateX: config.x },
          { translateY },
          { rotateX },
          { rotate: rotateZ }
        ],
        opacity: animatedValue.interpolate({
            inputRange: [0, 0.8, 1],
            outputRange: [1, 1, 0]
        })
      }}
    />
  );
};

const Confetti = () => (
  <View style={[StyleSheet.absoluteFill, { zIndex: 999 }]} pointerEvents="none">
    {[...Array(PARTICLE_COUNT)].map((_, i) => <ConfettiParticle key={i} />)}
  </View>
);

const Wheel = ({ onFinished }) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const currentRotation = useRef(0);
  const [spinning, setSpinning] = useState(false);

  const getSectorData = (index) => {
    let startAngle = 0;
    for (let i = 0; i < index; i++) startAngle += SECTORS[i].angle;
    const centerAngle = startAngle + SECTORS[index].angle / 2;
    return { startAngle, centerAngle, angle: SECTORS[index].angle };
  };

  const handleSpinPress = () => {
    if (spinning) return;
    setSpinning(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Always land on the 50% OFF slice (Index 2)
    const isWinner = true;
    const targetIndex = 2;

    const { centerAngle, angle: sectorWidth } = getSectorData(targetIndex);
    
    // We want the sector center to land at 270 degrees (Top)
    let targetVisualAngle = (270 - centerAngle); 
    if(targetVisualAngle < 0) targetVisualAngle += 360;

    const currentRot = currentRotation.current;
    const currentVisualAngle = currentRot % 360;

    let delta = targetVisualAngle - currentVisualAngle;
    if (delta < 0) delta += 360;

    const totalSpin = 1800 + delta;
    const randomOffset = (Math.random() * sectorWidth * 0.4) * (Math.random() > 0.5 ? 1 : -1);
    const finalValue = currentRot + totalSpin + randomOffset;

    // Anticipation “ticks”
    [3100, 3350, 3550, 3725, 3875, 3975].forEach((t) =>
      setTimeout(() => Haptics.selectionAsync(), t)
    );

    Animated.timing(spinValue, {
      toValue: finalValue,
      duration: 4000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
        currentRotation.current = finalValue;
        setSpinning(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(onFinished, 500);
    });
  };

  const spin = spinValue.interpolate({
      inputRange: [0, 360],
      outputRange: ['0deg', '360deg']
  });

  return (
    <View style={styles.wheelContainer}>
      <View style={styles.stopperContainer}>
        <Ionicons name="caret-down" size={50} color="#FDE68A" style={styles.stopper} />
      </View>

      <LinearGradient
        colors={['#FDE68A', '#F59E0B', '#B45309', '#FDE68A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.wheelBorder}
      >
        <Animated.View style={[styles.wheel, { transform: [{ rotate: spin }] }]}>
          <Svg height="300" width="300" viewBox="0 0 100 100">
            <Defs>
                <SvgGradient id="winnerGrad" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0" stopColor="#FFD700" />
                    <Stop offset="1" stopColor="#FFA500" />
                </SvgGradient>
            </Defs>
            {SECTORS.map((sector, index) => {
              let startAngle = 0;
              for(let i=0; i<index; i++) startAngle += SECTORS[i].angle;
              const endAngle = startAngle + sector.angle;
              
              const startRad = (startAngle * Math.PI) / 180;
              const endRad = (endAngle * Math.PI) / 180;
              const x1 = 50 + 50 * Math.cos(startRad);
              const y1 = 50 + 50 * Math.sin(startRad);
              const x2 = 50 + 50 * Math.cos(endRad);
              const y2 = 50 + 50 * Math.sin(endRad);
              
              const largeArcFlag = sector.angle > 180 ? 1 : 0;
              
              const d = `M50,50 L${x1},${y1} A50,50 0 ${largeArcFlag},1 ${x2},${y2} Z`;

              return (
                <G key={index}>
                  <Path 
                    d={d} 
                    fill={sector.isWinner ? "url(#winnerGrad)" : sector.color} 
                    stroke="rgba(0,0,0,0.35)" 
                    strokeWidth="0.7" 
                  />
                </G>
              );
            })}
          </Svg>
          
          {SECTORS.map((sector, index) => {
             let startAngle = 0;
             for(let i=0; i<index; i++) startAngle += SECTORS[i].angle;
             const midAngle = startAngle + sector.angle / 2;
             
             return (
                 <View key={index} style={[styles.sectorLabelContainer, { transform: [{ rotate: `${midAngle}deg` }] }]}>
                     <View style={styles.textWrapper}>
                        <Text style={[styles.sectorTextMain, { color: sector.textColor, fontSize: sector.isWinner ? 14 : 18 }]}>{sector.label}</Text>
                        <Text style={[styles.sectorTextSub, { color: sector.textColor, fontSize: sector.isWinner ? 8 : 10 }]}>{sector.sub}</Text>
                     </View>
                 </View>
             );
          })}
          
          <View style={styles.centerHub}>
             <View style={styles.centerHubInner} />
          </View>
        </Animated.View>
      </LinearGradient>

      <View style={styles.ctaWrap}>
        <TouchableOpacity
          style={[styles.spinButton, spinning && styles.spinButtonDisabled]}
          onPress={handleSpinPress}
          disabled={spinning}
          activeOpacity={1}
        >
          <LinearGradient
            colors={spinning ? ['#333', '#444'] : ['#F59E0B', '#D97706', '#B45309']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.spinButtonInner}
          >
            <View style={styles.spinButtonRow}>
              <Text style={styles.spinButtonText}>{spinning ? 'SPINNING...' : 'SPIN NOW'}</Text>
              <Ionicons name="chevron-forward" size={20} color="#0A0A0A" />
            </View>
            <Text style={styles.spinButtonSubText}>
              {spinning ? 'Landing on your offer…' : 'Try your luck'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const WinnerModal = ({ visible, onClaim }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <LinearGradient
          colors={['rgba(255, 43, 214, 0.15)', 'rgba(0, 229, 255, 0.08)', 'rgba(255, 179, 0, 0.12)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.cleanModalContent, styles.winnerModal]}
        >
          <View style={[styles.iconBadge, styles.winnerBadge]}>
            <Ionicons name="trophy" size={36} color="#FFB300" />
          </View>

          <Text style={styles.cleanTitle}>Exclusive Unlock!</Text>
          <Text style={styles.cleanSubtitle}>You've secured the best possible offer.</Text>

          <View style={styles.cleanPriceContainer}>
            <Text style={[styles.cleanPriceMain, { color: '#FFB300' }]}>50%</Text>
            <Text style={[styles.cleanPriceSub, { color: '#FFB300' }]}>OFF</Text>
          </View>

          <View style={{ width: '100%' }}>
            <TouchableOpacity
              style={styles.cleanButton}
              activeOpacity={0.85}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                onClaim();
              }}
            >
              <LinearGradient
                colors={['#FFB300', '#F59E0B', '#D97706']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.claimButtonInner}
              >
                <Text style={[styles.cleanButtonText, { color: '#000000' }]}>Claim 50% OFF</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
        <Confetti />
      </View>
    </Modal>
  );
};

export default function RewardWheel() {
  const router = useRouter();
  const [showWinner, setShowWinner] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => Math.floor(4500 + Math.random() * 1800)); 

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimeParts = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return {
      h: hours.toString().padStart(2, '0'),
      m: minutes.toString().padStart(2, '0'),
      s: seconds.toString().padStart(2, '0')
    };
  };

  const time = formatTimeParts(timeLeft);

  const handleClaim = () => {
    setShowWinner(false);
    router.replace({ pathname: '/utils/PaywallDiscount', params: { discount: '50' } });
  };

  return (
    <LinearGradient colors={['#111111', '#000000']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
            <View style={styles.limitedOfferWrap}>
              <Text style={styles.limitedOfferLabel}>LIMITED OFFER</Text>
            </View>
            <Text style={styles.timeLeftLabel}>TIME LEFT</Text>
            <View style={styles.timerContainer}>
              <View style={styles.timeBlock}>
                <Text style={styles.timeValue}>{time.h}</Text>
                <Text style={styles.timeLabel}>HOURS</Text>
              </View>
              <Text style={styles.timeSeparator}>:</Text>
              <View style={styles.timeBlock}>
                <Text style={styles.timeValue}>{time.m}</Text>
                <Text style={styles.timeLabel}>MINS</Text>
              </View>
              <Text style={styles.timeSeparator}>:</Text>
              <View style={styles.timeBlock}>
                <Text style={styles.timeValue}>{time.s}</Text>
                <Text style={styles.timeLabel}>SECS</Text>
              </View>
            </View>
            
            <Text style={styles.subtitle}>Spin for a chance to win a huge discount</Text>
        </View>

        <Wheel 
            onFinished={() => setShowWinner(true)}
        />

        <WinnerModal visible={showWinner} onClaim={handleClaim} />

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  header: { marginBottom: 26, alignItems: 'center', width: '100%' },
  limitedOfferWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  limitedOfferLabel: {
    fontSize: 28,
    color: '#F59E0B',
    marginBottom: 2,
    fontWeight: '900',
    letterSpacing: 2.0,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(245, 158, 11, 0.35)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  timeLeftLabel: { fontSize: 10, color: '#9CA3AF', marginBottom: 10, letterSpacing: 1.6, fontWeight: '800' },
  subtitle: { fontSize: 14, color: '#9CA3AF', marginTop: 14, letterSpacing: 0.2 },
  
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  timeBlock: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    minWidth: 66,
  },
  timeValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#F9FAFB',
    fontVariant: ['tabular-nums'],
  },
  timeLabel: {
    fontSize: 10,
    color: '#D1D5DB',
    fontWeight: '700',
    marginTop: 2,
    opacity: 0.8,
  },
  timeSeparator: {
    fontSize: 26,
    fontWeight: '900',
    color: '#F9FAFB',
    marginHorizontal: 8,
    marginTop: -10, // Align with numbers
  },
  
  wheelContainer: { alignItems: 'center', justifyContent: 'center' },
  wheelBorder: {
      padding: 7,
      borderRadius: 160,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 16,
      elevation: 10,
  },
  wheel: { width: 300, height: 300, position: 'relative', borderRadius: 150, overflow: 'hidden' },
  
  stopperContainer: {
      position: 'absolute',
      top: -30,
      zIndex: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.5,
      shadowRadius: 2,
  },
  stopper: {
      marginBottom: -15, // Adjust to overlap slightly
  },

  centerHub: {
      position: 'absolute',
      top: 130,
      left: 130,
      width: 40,
      height: 40,
      backgroundColor: '#F9FAFB',
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
  },
  centerHubInner: {
      width: 30,
      height: 30,
      backgroundColor: '#0B0D10',
      borderRadius: 15,
  },

  ctaWrap: { marginTop: 22, width: '100%' },
  spinButton: {
    width: '100%',
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  spinButtonInner: {
    paddingVertical: 16,
    paddingHorizontal: 54,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 66, // keep button height stable when text changes
  },
  spinButtonRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  spinButtonDisabled: {
      opacity: 0.5,
      shadowOpacity: 0,
  },
  spinButtonText: { fontWeight: '900', fontSize: 18, color: '#0A0A0A', letterSpacing: 1.2 },
  spinButtonSubText: { marginTop: 4, fontSize: 12, fontWeight: '800', color: 'rgba(10,10,10,0.75)' },
  
  sectorLabelContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrapper: {
      position: 'absolute',
      right: 30,
      width: 80,
      alignItems: 'center',
      transform: [{ rotate: '90deg' }], // Rotate text to be readable
  },
  sectorTextMain: {
    fontSize: 18,
    fontWeight: '900',
  },
  sectorTextSub: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: -2,
  },

  // Modal Styles
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.82)',
      justifyContent: 'center',
      alignItems: 'center',
  },
  cleanModalContent: {
      width: '85%',
      backgroundColor: '#101014',
      borderRadius: 20,
      padding: 32,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 10,
  },
  winnerModal: {
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.10)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 20,
  },
  iconBadge: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
  },
  winnerBadge: {
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(245, 158, 11, 0.2)',
      shadowColor: '#F59E0B',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 5,
  },
  cleanTitle: {
      fontSize: 26,
      fontWeight: '800',
      color: '#FFF',
      marginBottom: 12,
      textAlign: 'center',
      letterSpacing: 0.5,
  },
  cleanSubtitle: {
      fontSize: 16,
      color: '#AAA',
      textAlign: 'center',
      marginBottom: 32,
      lineHeight: 24,
      paddingHorizontal: 10,
  },
  cleanButton: {
      width: '100%',
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
  },
  claimButtonInner: {
      width: '100%',
      paddingVertical: 18,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
  },
  cleanButtonText: {
      fontSize: 16,
      fontWeight: '800',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
  },
  cleanPriceContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: 32,
  },
  cleanPriceMain: {
      fontSize: 60,
      fontWeight: '900',
      color: '#FF9500',
      lineHeight: 70,
  },
  cleanPriceSub: {
      fontSize: 24,
      fontWeight: '800',
      color: '#FF9500',
      marginLeft: 8,
  },
});
