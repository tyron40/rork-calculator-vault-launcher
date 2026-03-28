import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import AppTile from './AppTile';
import { InstalledApp } from '@/services/apps';

interface AppGridProps {
  apps: InstalledApp[];
  onAppPress: (app: InstalledApp) => void;
  onAppLongPress?: (app: InstalledApp) => void;
}

export default function AppGrid({ apps, onAppPress, onAppLongPress }: AppGridProps) {
  return (
    <FlatList
      data={apps}
      keyExtractor={(item) => item.packageName}
      numColumns={4}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <AppTile
          label={item.label}
          packageName={item.packageName}
          iconBase64={item.iconBase64}
          onPress={() => onAppPress(item)}
          onLongPress={onAppLongPress ? () => onAppLongPress(item) : undefined}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingTop: 16,
  },
});
