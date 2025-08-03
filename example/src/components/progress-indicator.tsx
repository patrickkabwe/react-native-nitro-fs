import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ProgressIndicatorProps {
  uploadProgress: number;
  downloadProgress: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  uploadProgress,
  downloadProgress,
}) => {
  if (uploadProgress === 0 && downloadProgress === 0) {
    return null;
  }

  return (
    <View style={styles.progressContainer}>
      {uploadProgress > 0 && (
        <View style={styles.progressItem}>
          <Text style={styles.progressLabel}>Upload Progress</Text>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${uploadProgress}%` }]}
            />
          </View>
          <Text style={styles.progressText}>{uploadProgress.toFixed(1)}%</Text>
        </View>
      )}
      {downloadProgress > 0 && (
        <View style={styles.progressItem}>
          <Text style={styles.progressLabel}>Download Progress</Text>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${downloadProgress}%` }]}
            />
          </View>
          <Text style={styles.progressText}>
            {downloadProgress.toFixed(1)}%
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  progressContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  progressItem: {
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e1e5e9',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  progressText: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
});
