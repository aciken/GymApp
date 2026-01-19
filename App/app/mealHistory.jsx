import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function MealHistoryScreen() {
  const router = useRouter();
  const { history } = useLocalSearchParams();
  const meals = history ? JSON.parse(history) : [];
  
  const totalScore = meals.reduce((sum, meal) => sum + meal.value, 0);
  const averageScore = meals.length > 0 ? Math.round(totalScore / meals.length) : 0;

  return (
    <LinearGradient colors={['#0A0A0A', '#000000']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Meal History</Text>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
              <Ionicons name="close-circle" size={32} color="#555" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{meals.length}</Text>
              <Text style={styles.statLabel}>Meals Today</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, averageScore < 0 ? styles.statValueNegative : styles.statValuePositive]}>
                {averageScore > 0 ? '+' : ''}{averageScore}%
              </Text>
              <Text style={styles.statLabel}>Avg. Score</Text>
            </View>
          </View>
        </View>
        
        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {meals.map((item, index) => (
            <View key={index} style={styles.mealCard}>
              <View style={styles.mealTop}>
                <View style={styles.mealLeft}>
                  <View style={[styles.mealDot, item.value < 0 && styles.mealDotNegative]} />
                  <View style={styles.mealInfo}>
                    <Text style={styles.mealLabel}>Meal {index + 1}</Text>
                    <Text style={styles.mealTime}>
                      {new Date(item.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
                <View style={[styles.scoreBadge, item.value < 0 && styles.scoreBadgeNegative]}>
                  <Text style={[styles.scoreText, item.value < 0 && styles.scoreTextNegative]}>
                    {item.value > 0 ? `+${item.value}` : item.value}%
                  </Text>
                </View>
              </View>
              <Text style={styles.mealDescription}>{item.description || `Meal ${index + 1}`}</Text>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    marginLeft: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statValuePositive: {
    color: '#4CAF50',
  },
  statValueNegative: {
    color: '#FF6B6B',
  },
  statLabel: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  mealCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  mealTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  mealLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mealDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    marginRight: 12,
  },
  mealDotNegative: {
    backgroundColor: '#FF6B6B',
  },
  mealInfo: {
    flex: 1,
  },
  mealLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  mealTime: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  scoreBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
    marginLeft: 12,
  },
  scoreBadgeNegative: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  scoreText: {
    color: '#4CAF50',
    fontSize: 15,
    fontWeight: 'bold',
  },
  scoreTextNegative: {
    color: '#FF6B6B',
  },
  mealDescription: {
    color: '#CCCCCC',
    fontSize: 15,
    lineHeight: 22,
  },
});

