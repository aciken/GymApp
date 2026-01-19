import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Svg, { Polygon, Line, Text as SvgText } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const graphSize = width * 0.7;
const centerX = graphSize / 2;
const centerY = graphSize / 2;
const radius = graphSize * 0.4;

const labels = [
  'Strength', 'Energy', 'Mood', 'Libido', 'Focus', 'Confidence'
];

const data = {
  day1: [0.3, 0.2, 0.25, 0.15, 0.3, 0.2],
  day50: [0.6, 0.7, 0.65, 0.75, 0.6, 0.7],
  day90: [0.9, 0.85, 0.9, 0.95, 0.8, 0.9],
};

const colors = {
  day1: '#D90429',
  day50: '#F77F00',
  day90: '#8AC926',
};

const dayKeys = Object.keys(data);

const generatePolygonPoints = (dataValues) => {
  return labels.map((_, i) => {
    const angle_rad = (Math.PI / 180) * (60 * i - 30);
    const r = radius * dataValues[i];
    const x = centerX + r * Math.cos(angle_rad);
    const y = centerY + r * Math.sin(angle_rad);
    return `${x},${y}`;
  }).join(' ');
};

const BenefitsGraph = () => {
  const router = useRouter();
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const animatedData = useMemo(() => data.day1.map(v => new Animated.Value(v)), []);
  const polygonRef = useRef(null);

  useEffect(() => {
    const dayKey = dayKeys[currentDayIndex];
    const targetData = data[dayKey];

    const animations = targetData.map((targetValue, index) => {
      return Animated.spring(animatedData[index], {
        toValue: targetValue,
        friction: 5,
        tension: 30,
        useNativeDriver: false,
      });
    });

    Animated.parallel(animations).start();
  }, [currentDayIndex, animatedData]);

  useEffect(() => {
    const listeners = animatedData.map(value =>
      value.addListener(() => {
        if (polygonRef.current) {
          const currentValues = animatedData.map(v => v.__getValue());
          const newPoints = generatePolygonPoints(currentValues);
          polygonRef.current.setNativeProps({ points: newPoints });
        }
      })
    );

    return () => {
      animatedData.forEach((value, index) => value.removeListener(listeners[index]));
    };
  }, [animatedData]);

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentDayIndex < dayKeys.length - 1) {
      setCurrentDayIndex(currentDayIndex + 1);
    } else {
      router.push('/onboarding/dosAndDonts');
    }
  };

  const dayKey = dayKeys[currentDayIndex];
  const dayTitle = `Day ${dayKey.replace('day', '')}`;
  const currentColor = colors[dayKey];

  return (
    <LinearGradient colors={['#101010', '#000000']} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Your Potential Growth</Text>
        <Text style={styles.description}>
          See how your key attributes can develop over the 90-day program.
        </Text>
        <View style={styles.graphAndDayContainer}>
          <View style={styles.dayTitleContainer}>
            <Text style={styles.dayTitleText}>{dayTitle}</Text>
          </View>

          <View style={styles.graphContainer}>
            <Svg height={graphSize} width={graphSize}>
              {/* Background Lines */}
              {labels.map((_, i) => {
                const angle_rad = (Math.PI / 180) * (60 * i - 30);
                const x2 = centerX + radius * Math.cos(angle_rad);
                const y2 = centerY + radius * Math.sin(angle_rad);
                return <Line key={i} x1={centerX} y1={centerY} x2={x2} y2={y2} stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />;
              })}
              
              {/* Concentric Hexagons */}
              {[0.25, 0.5, 0.75, 1].map(scale => (
                <Polygon
                  key={scale}
                  points={labels.map((_, i) => {
                    const angle_rad = (Math.PI / 180) * (60 * i - 30);
                    const r = radius * scale;
                    const x = centerX + r * Math.cos(angle_rad);
                    const y = centerY + r * Math.sin(angle_rad);
                    return `${x},${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="1"
                />
              ))}
              
              {/* Data Polygon */}
              <Polygon
                ref={polygonRef}
                points={generatePolygonPoints(data.day1)}
                fill={currentColor}
                fillOpacity="0.7"
                stroke={currentColor}
                strokeWidth="2"
              />
              
              {/* Labels */}
              {labels.map((label, i) => {
                const angle_rad = (Math.PI / 180) * (60 * i - 30);
                const r = radius * 1.15;
                const x = centerX + r * Math.cos(angle_rad);
                const y = centerY + r * Math.sin(angle_rad);
                return (
                  <SvgText
                    key={label}
                    x={x}
                    y={y}
                    fill="#FFFFFF"
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    {label}
                  </SvgText>
                );
              })}
            </Svg>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.continueButton} 
        onPress={handleContinue}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
      
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: 'rgba(255, 255, 255, 0.7)', // Changed from bluish color
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  graphAndDayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  graphContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  daySelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    padding: 10,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  dayTitleContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  dayTitleText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  dayButton: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  dayButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
});

export default BenefitsGraph;
