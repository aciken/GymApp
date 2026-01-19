import React from 'react';
import { View } from 'react-native';

// This component is never rendered, but it is required by Expo Router
// for the tab to appear in the tab bar. The onPress event is handled
// in the _layout.jsx file to open the settings modal.
export default function ProfileScreen() {
  return <View />;
}
