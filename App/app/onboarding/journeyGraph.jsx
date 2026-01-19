import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Easing, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Svg, { Path, Text as SvgText, Circle, Defs, LinearGradient as SvgLinearGradient, Stop, G, Rect } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const graphWidth = width - 40;
const graphHeight = 250;

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedImage = Animated.createAnimatedComponent(Image);

const JourneyGraph = () => {
  const router = useRouter();

  const greenPathLength = 400; 
  const redPathLength = 450;

  const greenPathAnim = useRef(new Animated.Value(greenPathLength)).current;
  const redPathAnim = useRef(new Animated.Value(redPathLength)).current;
  const rocketProgress = useRef(new Animated.Value(0)).current;
  
  const x1Anim = useRef(new Animated.Value(0)).current;
  const x2Anim = useRef(new Animated.Value(0)).current;
  const x3Anim = useRef(new Animated.Value(0)).current;
  const orangeDotAnim = useRef(new Animated.Value(0)).current;
  const rocketAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const drawAnimation = Animated.parallel([
      Animated.timing(greenPathAnim, {
        toValue: 0,
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(redPathAnim, {
        toValue: 0,
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(rocketProgress, {
        toValue: 1,
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]);

    const fadeInAnimation = Animated.sequence([
      Animated.delay(1500),
      Animated.timing(x1Anim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(x2Anim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(x3Anim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(orangeDotAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(rocketAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]);
    
    Animated.sequence([
      drawAnimation,
      fadeInAnimation,
      Animated.delay(500)
    ]).start();
  }, []);

  return (
    <LinearGradient colors={['#101010', '#000000']} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>The Two Paths to Boosting Testosterone</Text>
        <Text style={styles.description}>
          See the difference between a structured plan and conventional trial-and-error methods.
        </Text>

        <View style={styles.graphContainer}>
          <Svg width={graphWidth} height={graphHeight}>
            {/* Red Volatile Path */}
            <AnimatedPath
              d={`M 20 180 Q 60 140, 100 160 T 180 150 Q 220 80, 260 140 T 340 180`}
              stroke="url(#redGradient)"
              strokeWidth="3"
              fill="url(#redFillGradient)"
              strokeDasharray={redPathLength}
              strokeDashoffset={redPathAnim}
            />
            <Defs>
              <SvgLinearGradient id="redGradient" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#E53935" stopOpacity="1" />
                <Stop offset="1" stopColor="#D90429" stopOpacity="1" />
              </SvgLinearGradient>
              <SvgLinearGradient id="redFillGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#D90429" stopOpacity="0.4" />
                <Stop offset="1" stopColor="#101010" stopOpacity="0.1" />
              </SvgLinearGradient>
              <SvgLinearGradient id="orangeGradient" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#FFC300" />
                <Stop offset="1" stopColor="#FF5733" />
              </SvgLinearGradient>
              <SvgLinearGradient id="greenGradient" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#ADFF2F" />
                <Stop offset="1" stopColor="#8AC926" />
              </SvgLinearGradient>
              <SvgLinearGradient id="greenFillGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#8AC926" stopOpacity="0.3" />
                <Stop offset="1" stopColor="#101010" stopOpacity="0.1" />
              </SvgLinearGradient>
            </Defs>

            {/* Orange Steady Path */}
             <AnimatedPath
              d={`M 20 160 Q 100 100, 200 80 T 340 40`}
              stroke="url(#orangeGradient)"
              strokeWidth="3"
              fill="none"
              strokeDasharray={greenPathLength}
              strokeDashoffset={greenPathAnim}
            />
            
            {/* Start & End Points */}
            <Circle cx="20" cy="180" r="6" fill="#FFFFFF" />
            <Circle cx="20" cy="160" r="6" fill="#FFFFFF" />
            <AnimatedCircle cx="340" cy="40" r="6" fill="#FF5733" opacity={orangeDotAnim} />

            {/* Labels */}
            
          </Svg>
          <AnimatedImage
            source={require('../../assets/RocketImage2.png')}
            style={[
                styles.rocketImage,
                {
                    transform: [
                        {
                            translateX: rocketProgress.interpolate({
                                inputRange: [0, 0.5, 1],
                                outputRange: [20, 200, 350], // Increased final X
                            })
                        },
                        {
                            translateY: rocketProgress.interpolate({
                                inputRange: [0, 0.5, 1],
                                outputRange: [160, 80, 35], // Decreased final Y for more upward motion
                            })
                        },
                        {
                            rotate: rocketProgress.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['30deg', '40deg'], // Steeper start angle
                            })
                        }
                    ]
                }
            ]}
          />
          <View style={[styles.graphLabel, { top: 5, right: 20 }]}>
            <View style={[styles.labelDot, { backgroundColor: '#FF5733' }]} />
            <Text style={styles.graphLabelText}>With Boost</Text>
          </View>
          <View style={[styles.graphLabel, { bottom: 30, right: 0 }]}>
            <View style={[styles.labelDot, { backgroundColor: '#E53935' }]} />
            <Text style={styles.graphLabelText}>Conventional Methods</Text>
          </View>
        </View>

        {/* Labels for the x-axis */}
        <View style={styles.labelsContainer}>
          <Text style={styles.labelText}>Day 1</Text>
          <Text style={styles.labelText}>Day 60</Text>
          <Text style={styles.labelText}>Day 90</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.continueButton} 
          onPress={() => router.push('/onboarding/benefitsGraph')}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
        
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 40,
  },
  graphContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  rocketImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    position: 'absolute',
    left: -25, // Center the image on the path
    top: -25, // Center the image on the path
  },
  graphLabel: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  labelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  graphLabelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  continueButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  continueButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: graphWidth,
    marginTop: -15, // Moved up even more
  },
  labelText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

export default JourneyGraph;
