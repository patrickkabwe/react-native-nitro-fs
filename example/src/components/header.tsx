import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const Header: React.FC = () => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>NitroFS Explorer</Text>
      <Text style={styles.subtitle}>File System Operations</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#007AFF',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
});
