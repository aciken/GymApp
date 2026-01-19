import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGlobalContext } from '../context/GlobalProvider';

export default function StartAdventure() {
  const params = useLocalSearchParams();
  const { setSelectedAdventure } = useGlobalContext();
  const router = useRouter();

  const getAdventureImage = (imageName) => {
    switch (imageName) {
      case 'GraphitImage.png': return require('../../assets/GraphitImage.png');
      case 'ForestImage.png': return require('../../assets/ForestImage.png');
      case 'MountainImage.png': return require('../../assets/MountainImage.png');
      case 'CarImage.png': return require('../../assets/CarImage.png');
      default: return require('../../assets/icon.png');
    }
  };

  const handleStart = () => {
    setSelectedAdventure(params);
    router.back();
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0C1126' }}>
      <ImageBackground
        source={getAdventureImage(params.image)}
        style={{ flex: 1, justifyContent: 'flex-end' }}
        imageStyle={{ opacity: 0.4 }}
      >
        <LinearGradient
          colors={['transparent', 'rgba(12, 17, 38, 0.8)', '#0C1126']}
          style={{ padding: 20, paddingTop: 60 }}
        >
          <TouchableOpacity 
            onPress={() => router.back()}
            style={{ position: 'absolute', top: 40, left: 20 }}
          >
            <Ionicons name="close-circle" size={32} color="#FFFFFF" />
          </TouchableOpacity>
          
          <Text style={{ color: '#FFFFFF', fontSize: 36, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 0, height: 2}, textShadowRadius: 4 }}>
            {params.title}
          </Text>
          <Text style={{ color: '#B3B8C8', fontSize: 18, marginTop: 4, marginBottom: 24 }}>
            {params.section}
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 32 }}>
            <View style={{ alignItems: 'center' }}>
              <Ionicons name="star-outline" size={24} color="#FFCC00" />
              <Text style={{ color: '#FFFFFF', marginTop: 4 }}>{params.difficulty}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Ionicons name="time-outline" size={24} color="#00DDFF" />
              <Text style={{ color: '#FFFFFF', marginTop: 4 }}>{params.duration}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            onPress={handleStart}
            style={{
              backgroundColor: '#00DDFF',
              paddingVertical: 16,
              borderRadius: 30,
              alignItems: 'center',
              shadowColor: '#00DDFF',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.5,
              shadowRadius: 8,
            }}
          >
            <Text style={{ color: '#0C1126', fontSize: 18, fontWeight: 'bold' }}>
              Start Adventure
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}
