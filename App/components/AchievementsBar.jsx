import React from 'react';
import { View, ScrollView, Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useGlobalContext } from '../app/context/GlobalProvider';
import { allBadges } from '../data/badgeData';

const AchievementsBar = () => {
  const { user } = useGlobalContext();
  const router = useRouter();
  
  const unlockedBadges = allBadges.filter(badge => user?.unlockedAchievements?.includes(badge.id));

  if (unlockedBadges.length === 0) {
    return null; // Don't render anything if no badges are unlocked
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Achievements</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollView}>
        {unlockedBadges.map(badge => (
          <TouchableOpacity 
            key={badge.id} 
            style={styles.badgeContainer}
            onPress={() => router.push('/allBadges')} // Navigate to the list of all badges
          >
            <Image source={badge.image} style={styles.badgeImage} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  scrollView: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  badgeContainer: {
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  badgeImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFA500',
  },
});

export default AchievementsBar;
