import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Lightweight badge "image" replacement that doesn't require local assets.
 */
export default function IconBadge({
  icon = 'trophy-outline',
  size = 96,
  color = '#FFFFFF',
  backgroundColor = 'rgba(255,255,255,0.08)',
  borderColor = 'rgba(255,255,255,0.16)',
  label,
}) {
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
          borderColor,
        },
      ]}
    >
      <Ionicons name={icon} size={Math.round(size * 0.5)} color={color} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  label: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '700',
  },
});


