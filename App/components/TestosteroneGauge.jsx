import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { G, Line, Defs, LinearGradient as SvgLinearGradient, Stop, Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import MaskedView from '@react-native-masked-view/masked-view';

const TestosteroneGauge = ({ value, size = 320, strokeWidth = 3 }) => {
  const center = size / 2;
  const radius = center - 30;
  
  // Animation value
  const animatedValue = useRef(new Animated.Value(250)).current;
  
  const minLevel = 250;
  const maxLevel = 1100;
  const range = maxLevel - minLevel;
  
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value,
      duration: 1500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // Required for listener
    }).start();
  }, [value]);

  // Calculate progress based on input value
  const progress = Math.min(Math.max(value, minLevel), maxLevel);
  const percentage = (progress - minLevel) / range;

  const startAngle = -135;
  const endAngle = 135;
  const totalAngle = endAngle - startAngle;

  const polarToCartesian = (angle, r) => {
    const a = (angle - 90) * Math.PI / 180.0;
    const x = center + r * Math.cos(a);
    const y = center + r * Math.sin(a);
    return { x, y };
  };

  // Ticks configuration
  const numTicks = 60;
  const longTickInterval = 10;
  
  const renderTicks = () => {
    const ticks = [];
    for (let i = 0; i <= numTicks; i++) {
      const tickAngle = startAngle + (i / numTicks) * totalAngle;
      const isLongTick = i % longTickInterval === 0;
      const tickLength = isLongTick ? 12 : 6;
      const innerRadius = radius - tickLength;
      
      const startPoint = polarToCartesian(tickAngle, innerRadius);
      const endPoint = polarToCartesian(tickAngle, radius);
      
      // Determine if this tick should be active based on percentage
      const isFilled = i / numTicks <= percentage;
      
      ticks.push(
        <Line
          key={i}
          x1={startPoint.x}
          y1={startPoint.y}
          x2={endPoint.x}
          y2={endPoint.y}
          stroke={isFilled ? 'url(#grad)' : 'rgba(255, 255, 255, 0.1)'}
          strokeWidth={isLongTick ? 3 : 1.5}
          strokeLinecap="round"
          opacity={isFilled ? 1 : 0.5}
        />
      );
    }
    return ticks;
  };

  // Background Arc (optional subtle track)
  const createArcPath = (r, start, end) => {
      const startPoint = polarToCartesian(end, r);
      const endPoint = polarToCartesian(start, r);
      const largeArcFlag = end - start <= 180 ? "0" : "1";
      return [
          "M", startPoint.x, startPoint.y, 
          "A", r, r, 0, largeArcFlag, 0, endPoint.x, endPoint.y
      ].join(" ");
  };

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgLinearGradient id="grad" x1="0" y1="1" x2="1" y2="0">
            <Stop offset="0" stopColor="#FF512F" stopOpacity="1" />
            <Stop offset="0.5" stopColor="#F09819" stopOpacity="1" />
            <Stop offset="1" stopColor="#FF512F" stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>
        
        {/* Background Track Arc */}
        <Path 
            d={createArcPath(radius + 15, startAngle, endAngle)}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
        />

        <G>{renderTicks()}</G>
      </Svg>

      <View style={styles.textContainer}>
        <View style={styles.scoreContainer}>
             <MaskedView
                style={styles.maskedView}
                maskElement={
                    <View style={styles.maskContainer}>
                        <Text style={styles.valueText}>{Math.round(value)}</Text>
                    </View>
                }
              >
                <LinearGradient
                  colors={['#FFD8A8', '#FF8C00']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={{ flex: 1 }}
                />
              </MaskedView>
              <Text style={styles.unitText}>ng/dl</Text>
        </View>
        
        <View style={styles.labelContainer}>
            <Ionicons name="analytics-outline" size={14} color="#666" style={{ marginRight: 4 }} />
            <Text style={styles.scoreLabel}>APPROXIMATE SCORE</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300, 
    width: 320,
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 20,
  },
  scoreContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10, 
  },
  maskedView: {
    height: 90,
    width: 240,
  },
  maskContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  valueText: {
    fontSize: 76,
    fontWeight: '900',
    color: 'black', // Must be black for MaskedView
    textAlign: 'center',
    letterSpacing: -1,
  },
  unitText: {
    color: '#666',
    fontSize: 18,
    fontWeight: '600',
    marginTop: -5,
    textTransform: 'lowercase',
    opacity: 0.8,
  },
  labelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 15,
      backgroundColor: 'rgba(255,255,255,0.05)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)',
  },
  scoreLabel: {
    color: '#888',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
});

export default TestosteroneGauge;
