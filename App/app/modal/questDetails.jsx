import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';

export default function QuestDetails() {
  const params = useLocalSearchParams();
  const { title, section, difficulty, duration, image } = params;

  const [checked, setChecked] = React.useState([false, false, false, false]);

  const toggleCheck = (index) => {
    setChecked(prev => {
      const newChecked = [...prev];
      newChecked[index] = !newChecked[index];
      return newChecked;
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0C1126' }}>
      <ImageBackground
        source={require('../../assets/GraphitImage.png')} // Placeholder; can be dynamic
        style={{ height: 200, justifyContent: 'flex-end' }}
        imageStyle={{ opacity: 0.3 }}
      >
        <LinearGradient
          colors={['transparent', '#0C1126']}
          style={{ height: '100%', justifyContent: 'flex-end', padding: 20 }}
        >
          <TouchableOpacity 
            onPress={() => router.back()}
            style={{ position: 'absolute', top: 40, left: 20 }}
          >
            <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          
          <Text style={{ color: '#FFFFFF', fontSize: 32, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 0, height: 2}, textShadowRadius: 4 }}>
            {title}
          </Text>
          <Text style={{ color: '#B3B8C8', fontSize: 16, marginTop: 4 }}>
            {section} • {difficulty} • {duration}
          </Text>
        </LinearGradient>
      </ImageBackground>
      
      <ScrollView style={{ padding: 20 }}>
        <View style={{
          backgroundColor: 'rgba(30, 39, 71, 0.7)',
          borderRadius: 20,
          padding: 16,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: 'rgba(0, 221, 255, 0.2)',
          shadowColor: '#00DDFF',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name="book-outline" size={24} color="#00DDFF" style={{ marginRight: 8 }} />
            <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' }}>
              Description
            </Text>
          </View>
          <Text style={{ color: '#B3B8C8', fontSize: 16 }}>
            Embark on an exciting journey through the mysterious {title.toLowerCase()}. Discover hidden treasures and face thrilling challenges in this adventure-packed quest!
          </Text>
        </View>
        
        <View style={{
          backgroundColor: 'rgba(30, 39, 71, 0.7)',
          borderRadius: 20,
          padding: 16,
          marginBottom: 32,
          borderWidth: 1,
          borderColor: 'rgba(118, 255, 3, 0.2)',
          shadowColor: '#76FF03',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Ionicons name="checkbox-outline" size={24} color="#76FF03" style={{ marginRight: 8 }} />
            <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' }}>
              Instructions
            </Text>
          </View>
          {[
            'Prepare your gear and enter the quest area.',
            'Follow the map to key locations.',
            'Solve puzzles and overcome obstacles.',
            'Collect rewards and complete the quest!'
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => toggleCheck(index)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                borderBottomWidth: index < 3 ? 1 : 0,
                borderBottomColor: 'rgba(255, 255, 255, 0.1)',
              }}
            >
              <Ionicons 
                name={checked[index] ? 'checkbox' : 'checkbox-outline'} 
                size={24} 
                color={checked[index] ? '#76FF03' : '#B3B8C8'} 
                style={{ 
                  marginRight: 12,
                  shadowColor: checked[index] ? '#76FF03' : 'transparent',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 4,
                }} 
              />
              <Text style={{ 
                color: checked[index] ? '#FFFFFF' : '#B3B8C8', 
                fontSize: 16, 
                flex: 1,
                textDecorationLine: checked[index] ? 'line-through' : 'none'
              }}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
      <TouchableOpacity 
        style={{
          backgroundColor: '#00DDFF',
          paddingVertical: 16,
          margin: 20,
          borderRadius: 30,
          alignItems: 'center',
          shadowColor: '#00DDFF',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.5,
          shadowRadius: 8,
        }}
      >
        <Text style={{ color: '#0C1126', fontSize: 18, fontWeight: 'bold' }}>
          Start Quest
        </Text>
      </TouchableOpacity>
    </View>
  );
}
