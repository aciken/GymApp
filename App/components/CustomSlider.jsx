import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';

const formatValue = (value, unit) => {
  if (unit === 'minutes') {
    const hours = Math.floor(value / 60);
    const minutes = value % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
  return `${value} ${unit}`;
};

const CustomSlider = ({ min, max, initialValue, onValueChange, unit, step = 1 }) => {
  const [localValue, setLocalValue] = useState(initialValue);
  const lastHapticValue = useRef(initialValue);
  
  useEffect(() => {
    setLocalValue(initialValue);
  }, [initialValue]);

  const handleValueChange = (value) => {
    setLocalValue(value);
    
    if (Math.round(value) !== Math.round(lastHapticValue.current)) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      lastHapticValue.current = value;
    }
  };

  const handleSlidingComplete = (value) => {
    const roundedValue = Math.round(value / step) * step;
    onValueChange(roundedValue);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.valueText}>
        {formatValue(localValue, unit)}
      </Text>

      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          step={step}
          value={localValue}
          onValueChange={handleValueChange}
          onSlidingComplete={handleSlidingComplete}
          minimumTrackTintColor="#FF9500"
          maximumTrackTintColor="rgba(255, 255, 255, 0.1)"
          thumbTintColor="#FFFFFF"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  valueText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  sliderContainer: {
    width: '100%',
    height: 40,
    justifyContent: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
});

export default CustomSlider;
