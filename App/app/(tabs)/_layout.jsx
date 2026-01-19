import React from 'react';
import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import * as Haptics from 'expo-haptics';

export default function TabsLayout() {
  const handleTabPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#555555',
        tabBarStyle: { 
          position: 'absolute',
          borderTopWidth: 0,
          backgroundColor: '#000000',
          paddingTop: 10,
        },
        tabBarLabelPosition: 'below-icon',
      }}
    >
      <Tabs.Screen 
        name="home"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="home" size={28} color={color} />,
        }}
        listeners={{ tabPress: handleTabPress }}
      />
      <Tabs.Screen 
        name="statistics"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="stats-chart" size={28} color={color} />,
        }}
        listeners={{ tabPress: handleTabPress }}
      />
      <Tabs.Screen 
        name="profile"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="person" size={28} color={color} />,
        }}
        listeners={{
          tabPress: (e) => {
            handleTabPress();
            e.preventDefault();
            router.push('/modal/settings');
          },
        }}
      />
    </Tabs>
  );
}
