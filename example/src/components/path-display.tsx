import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PathDisplayProps {
  currentPath: string;
  onNavigateBack: () => void;
}

export const PathDisplay: React.FC<PathDisplayProps> = ({
  currentPath,
  onNavigateBack,
}) => {
  return (
    <View style={styles.pathContainer}>
      <Text style={styles.pathLabel}>Current Path:</Text>
      <Text style={styles.pathText} numberOfLines={1}>
        {currentPath || '/'}
      </Text>
      {currentPath && (
        <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  pathContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
    flexDirection: 'row',
    alignItems: 'center',
  },
  pathLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  pathText: {
    flex: 1,
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});
