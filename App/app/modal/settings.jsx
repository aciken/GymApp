import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, StyleSheet, Alert, Linking } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalContext } from '../context/GlobalProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Purchases from 'react-native-purchases';
import * as WebBrowser from 'expo-web-browser';
import axios from 'axios';

const SettingOption = ({ icon, text, onPress, isDestructive }) => (
  <TouchableOpacity 
    style={styles.optionButton}
    onPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }}
  >
    <Ionicons name={icon} size={24} color={isDestructive ? '#FF453A' : '#8A95B6'} />
    <Text style={[styles.optionText, isDestructive && styles.destructiveText]}>{text}</Text> 
    {!isDestructive && <Ionicons name="chevron-forward" size={20} color="#555" />}
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const { user, setIsAuthenticated, setUser, setIsPro } = useGlobalContext();

  const handleLogout = async () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive",
          onPress: async () => {
            try {
              setIsAuthenticated(false);
              setUser(null);
              setIsPro(false);
              await Purchases.logOut();
              

              await AsyncStorage.removeItem('user');
              router.replace('/'); 
            } catch (e) {
              Alert.alert("Error", "Failed to log out. Please try again.");
            }
          } 
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              if (user && user._id) {
                 await axios.post('https://testosterone.onrender.com/auth/delete', { userId: user._id });
              }
              
              setIsAuthenticated(false);
              setUser(null);
              setIsPro(false);
              await Purchases.logOut();
              await AsyncStorage.removeItem('user');
              router.replace('/'); 
            } catch (error) {
              console.error("Delete account error:", error);
              Alert.alert("Error", "Failed to delete account. Please try again.");
            }
          } 
        }
      ]
    );
  };

  const openLink = (url) => {
    WebBrowser.openBrowserAsync(url);
  };

  return (
    <LinearGradient colors={['#101010', '#000000']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.doneButton}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingText}>Hello, {user?.name || 'User'}</Text>
          </View>

          <View style={styles.section}>
            <SettingOption 
              icon="star-outline" 
              text="Subscription" 
              onPress={() => Linking.openURL('https://apps.apple.com/account/subscriptions')} 
            />
            <SettingOption icon="document-text-outline" text="Privacy Policy" onPress={() => openLink('https://www.boostestapp.com/privacy')} />
            <SettingOption icon="reader-outline" text="Terms of Use" onPress={() => openLink('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')} />
            <SettingOption icon="globe-outline" text="Website" onPress={() => openLink('https://www.boostestapp.com')} />
            <SettingOption icon="mail-outline" text="Contact Us" onPress={() => openLink('mailto:team@boostestapp.com')} />
          </View>

          <View style={{ flex: 1 }} />

          <View style={styles.section}>
            <SettingOption 
              icon="log-out-outline" 
              text="Log Out" 
              onPress={handleLogout}
              isDestructive 
            />
            <SettingOption 
              icon="trash-outline" 
              text="Delete Account" 
              onPress={handleDeleteAccount}
              isDestructive 
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  doneButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollViewContent: {
    padding: 20,
    flexGrow: 1,
  },
  greetingContainer: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 10,
  },
  greetingText: {
    color: '#E0E0E0',
    fontSize: 26,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#1C1C1E',
    borderRadius: 15,
    marginBottom: 30,
    overflow: 'hidden',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginLeft: 20,
    flex: 1,
  },
  destructiveText: {
    color: '#FF453A',
  },
}); 