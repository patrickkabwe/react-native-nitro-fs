import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FileItem as FileItemType } from '../types';
import { formatFileSize, getFileIcon } from '../utils/file-utils';

interface FileItemProps {
  item: FileItemType;
  isSelected: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onReadFile: () => void;
  onDelete: () => void;
}

export const FileItem: React.FC<FileItemProps> = ({
  item,
  isSelected,
  onPress,
  onLongPress,
  onReadFile,
  onDelete,
}) => {
  return (
    <TouchableOpacity
      style={[styles.fileItem, isSelected && styles.selectedFile]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={styles.fileInfo}>
        <Text
          style={[styles.fileIcon, item.isDirectory && styles.directoryIcon]}
        >
          {getFileIcon(item.name, item.isDirectory)}
        </Text>
        <View style={styles.fileDetails}>
          <Text style={styles.fileName} numberOfLines={1}>
            {item.name}
          </Text>
          {!item.isDirectory && (
            <Text style={styles.fileSize}>
              {item.size !== undefined ? formatFileSize(item.size) : 'Unknown size'}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.fileActions}>
        {!item.isDirectory && (
          <TouchableOpacity style={styles.actionButton} onPress={onReadFile}>
            <Text style={styles.actionButtonText}>👁️</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={onDelete}
        >
          <Text style={styles.actionButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fileItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedFile: {
    backgroundColor: '#e3f2fd',
    borderColor: '#007AFF',
    borderWidth: 1,
  },
  fileInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  directoryIcon: {
    fontSize: 20,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
  },
  fileActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  actionButtonText: {
    fontSize: 16,
  },
});
