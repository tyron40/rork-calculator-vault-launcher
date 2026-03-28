import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Package } from 'lucide-react-native';

interface AppTileProps {
  label: string;
  packageName: string;
  iconBase64?: string;
  onPress: () => void;
  onLongPress?: () => void;
}

export default function AppTile({ 
  label, 
  packageName, 
  iconBase64, 
  onPress, 
  onLongPress 
}: AppTileProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {iconBase64 && iconBase64.length > 0 ? (
          <Image
            source={{ uri: `data:image/png;base64,${iconBase64}` }}
            style={styles.icon}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.placeholderIcon}>
            <Package size={32} color="#8b5cf6" />
          </View>
        )}
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '25%',
    paddingHorizontal: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  icon: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  placeholderIcon: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2d3142',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 16,
  },
});
