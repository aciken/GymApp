import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function LessOfMan() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Image source={require('../../assets/Cartoon3.png')} style={styles.image} />
      
      <Text style={styles.title}>Becoming less of a man?</Text>
      
      <Text style={styles.description}>
        Low testosterone is scientifically linked to decreased muscle mass, energy, and libido, making you feel like a less of a man.
      </Text>
      
      <View style={styles.dotsContainer}>
        <View style={styles.dot} />
        <View style={[styles.dot, styles.activeDot]} />
        <View style={styles.dot} />
      </View>
      
      <TouchableOpacity style={styles.button} onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push('/onboarding/weaknessInfo');
      }}>
        <Text style={styles.buttonText}>Next</Text>
        <Ionicons name="chevron-forward-outline" size={24} color="#000" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D90429', // Red background
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 30,
  },
  image: {
    width: 350,
    height: 350,
    resizeMode: 'contain',
    marginTop: 40,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  description: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 25,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginVertical: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
  },
  button: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 30,
    marginBottom: 40,
  },
  buttonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 5,
  },
});
