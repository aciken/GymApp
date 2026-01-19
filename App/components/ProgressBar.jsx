import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const ProgressBar = ({ progress }) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (containerWidth > 0) {
      Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [containerWidth]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, containerWidth],
  });

  const onLayout = (event) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={styles.progressBarContainer} onLayout={onLayout}>
      <LinearGradient
        colors={['#FFA500', '#FF8C00']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.progressBar, { width: `${progress}%` }]}
      >
        {containerWidth > 0 && (
          <Animated.View
            style={[
              styles.shimmerWrapper,
              { transform: [{ translateX }] }
            ]}
          >
            <LinearGradient
              colors={['transparent', 'rgba(255, 255, 255, 0.3)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shimmer}
            />
          </Animated.View>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    marginLeft: 15,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden', // Add overflow hidden to clip the shimmer
  },
  shimmerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: 100,
  },
  shimmer: {
    width: '100%',
    height: '100%',
  },
});

export default ProgressBar;
