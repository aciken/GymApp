import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, Image, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { dailyDos, dailyDonts } from '../../data/programData';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;
const SPACING = (width - CARD_WIDTH) / 2;

const allHabits = [
  ...dailyDos,
  ...dailyDonts
];

const habits = allHabits.slice(0, 4);

const HabitCard = ({ item, scrollX, index }) => {
  const inputRange = [(index - 1) * CARD_WIDTH, index * CARD_WIDTH, (index + 1) * CARD_WIDTH];
  
  const scale = scrollX.interpolate({ inputRange, outputRange: [0.9, 1, 0.9], extrapolate: 'clamp' });
  const opacity = scrollX.interpolate({ inputRange, outputRange: [0.5, 1, 0.5], extrapolate: 'clamp' });
  const imageTranslateX = scrollX.interpolate({ inputRange, outputRange: [-width * 0.1, 0, width * 0.1], extrapolate: 'clamp' });

  return (
    <Animated.View style={[styles.cardContainer, { transform: [{ scale }], opacity }]}>
      <View style={styles.cardInner}>
        <Animated.Image source={item.image} style={[styles.cardImage, { transform: [{ translateX: imageTranslateX }] }]} />
        <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.95)']}
            style={styles.cardOverlay}
        >
            <View style={styles.textWrapper}>
                <Text style={styles.cardTitle}>{item.task.toUpperCase()}</Text>
                <View style={styles.separator} />
                <Text style={styles.cardDescription}>{item.description}</Text>
            </View>
        </LinearGradient>
        <View style={styles.cardBorder} />
      </View>
    </Animated.View>
  );
};

export default function DosAndDonts() {
  const router = useRouter();
  const [buttonVisible, setButtonVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef(new Animated.Value(0)).current;

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      if (newIndex > 0 && newIndex <= habits.length) {
        setCurrentIndex(newIndex - 1); // Adjust for spacer
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      if (newIndex >= habits.length && !buttonVisible) { 
        setButtonVisible(true);
        Animated.spring(buttonScaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }).start();
      }
    }
  }).current;

  return (
    <LinearGradient colors={['#1A1A1A', '#000000']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>KEY HABITS</Text>
          <Text style={styles.headerSubtitle}>Swipe to discover the pillars of high testosterone.</Text>
        </View>

        <View style={styles.contentContainer}>
          <Animated.FlatList
            style={{ height: height * 0.55, flexGrow: 0 }}
            data={[{id: 'left-spacer'}, ...habits, {id: 'right-spacer'}]}
            renderItem={({ item, index }) => {
              if (item.id === 'left-spacer' || item.id === 'right-spacer') return <View style={{ width: SPACING }} />;
              return <HabitCard item={item} scrollX={scrollX} index={index - 1} />;
            }}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH}
            decelerationRate="fast"
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ viewableItemsChanged: true, itemVisiblePercentThreshold: 50 }}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })}
            scrollEventThrottle={16}
          />
        </View>

        <View style={styles.footer}>
          <View style={styles.dotsContainer}>
            {allHabits.map((_, index) => {
              const isActive = index === currentIndex;
              return (
                <View 
                  key={index} 
                  style={[
                    styles.dot, 
                    isActive ? styles.activeDot : {}
                  ]} 
                />
              );
            })}
          </View>
          {buttonVisible &&
            <Animated.View style={{ transform: [{ scale: buttonScaleAnim }], width: '100%', alignItems: 'center' }}>
              <TouchableOpacity 
                style={styles.buttonTouchable}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push('/onboarding/ranksInfo');
                }}
              >
                <LinearGradient colors={['#FFC300', '#FF8C00']} style={styles.continueButton}>
                    <Text style={styles.continueButtonText}>I WANT MORE</Text>
                    <Ionicons name="arrow-forward" size={20} color="#000" style={{ marginLeft: 8 }} />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          }
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, justifyContent: 'space-between', paddingVertical: 20 },
  header: { 
    alignItems: 'center', 
    paddingHorizontal: 30,
    marginTop: 10,
  },
  headerTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '900', letterSpacing: 2, textAlign: 'center' },
  headerSubtitle: { color: '#888', fontSize: 14, marginTop: 8, textAlign: 'center', lineHeight: 20, fontWeight: '500' },
  
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: height * 0.52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInner: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#111',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  cardImage: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    resizeMode: 'cover',
  },
  cardOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
  },
  textWrapper: {
    marginBottom: 10,
  },
  cardBorder: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 10,
  },
  separator: {
    width: 40,
    height: 3,
    backgroundColor: '#FF9500',
    marginBottom: 12,
    borderRadius: 2,
  },
  cardDescription: {
    color: '#DDD',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  footer: { 
    minHeight: 100,
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FF9500',
    width: 20,
    opacity: 1,
  },
  buttonTouchable: {
    width: '100%',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  continueButton: {
    flexDirection: 'row',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  continueButtonText: { 
    color: '#000', 
    fontSize: 16, 
    fontWeight: '900', 
    letterSpacing: 1 
  },
});
