import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FileItem as FileItemType } from '../types';
import { FileItem } from './file-item';

interface FileListProps {
  files: FileItemType[];
  loading: boolean;
  selectedFile: FileItemType | null;
  onSelectFile: (file: FileItemType) => void;
  onNavigateToDirectory: (file: FileItemType) => void;
  onReadFile: (file: FileItemType) => void;
  onDeleteFile: (file: FileItemType) => void;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  loading,
  selectedFile,
  onSelectFile,
  onNavigateToDirectory,
  onReadFile,
  onDeleteFile,
}) => {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (files.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📁</Text>
        <Text style={styles.emptyText}>No files in this directory</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.fileList} showsVerticalScrollIndicator={false}>
      {files.map(item => (
        <FileItem
          key={item.path}
          item={item}
          isSelected={selectedFile?.path === item.path}
          onPress={() => onSelectFile(item)}
          onLongPress={() => onNavigateToDirectory(item)}
          onReadFile={() => onReadFile(item)}
          onDelete={() => onDeleteFile(item)}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  fileList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
