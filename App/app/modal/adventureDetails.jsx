import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function AdventureDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const adventure = JSON.parse(params.adventure);

  const getIconForQuest = (quest) => {
    switch (quest.type) {
      case 'boss': return 'skull';
      case 'treasure': return 'key';
      default: return 'star';
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0C1126' }}>
      <LinearGradient colors={['#1e2747', '#0c1126']} style={{ padding: 20, paddingTop: 60 }}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={{ position: 'absolute', top: 40, left: 20, zIndex: 1 }}
        >
          <Ionicons name="arrow-back-circle" size={32} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', textAlign: 'center' }}>{adventure.title}</Text>
        <Text style={{ color: '#B3B8C8', fontSize: 16, textAlign: 'center', marginTop: 4 }}>{adventure.section}</Text>
      </LinearGradient>
      
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingVertical: 40 }}>
        {adventure.quests.map((quest, index) => {
          const isLocked = quest.status === 'locked';
          const isActive = quest.status === 'active';
          const isCompleted = quest.status === 'completed';

          return (
            <TouchableOpacity
              key={quest.id}
              disabled={isLocked}
              onPress={() => {
                const questData = {
                  ...quest,
                  adventureTitle: adventure.title,
                  section: adventure.section,
                  image: adventure.image,
                  duration: '10 mins',
                  difficulty: 'Easy',
                  progress: 0,
                };
                router.push({ pathname: '/modal/startAdventure', params: questData });
              }}
              style={{
                alignItems: 'center',
                marginBottom: 30,
                opacity: isLocked ? 0.5 : 1,
              }}
            >
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: isActive ? '#00DDFF' : (isCompleted ? '#76FF03' : '#1e2747'),
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 4,
                  borderColor: isActive ? 'rgba(0, 221, 255, 0.5)' : (isCompleted ? 'rgba(118, 255, 3, 0.5)' : '#141a2f'),
                  shadowColor: isActive ? '#00DDFF' : (isCompleted ? '#76FF03' : '#000'),
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: isActive || isCompleted ? 0.6 : 0,
                  shadowRadius: 10,
                }}
              >
                <Ionicons name={getIconForQuest(quest)} size={36} color={isActive ? '#0C1126' : '#FFFFFF'} />
              </View>
              <Text style={{ color: '#FFFFFF', fontWeight: 'bold', marginTop: 8, fontSize: 16 }}>
                {quest.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
