import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import NitroFS from 'react-native-nitro-fs';
import { DirectoryType } from '../types';

interface DirectoryNavigationProps {
  currentPath: string;
  onNavigate: (dirType: DirectoryType) => void;
}

export const DirectoryNavigation: React.FC<DirectoryNavigationProps> = ({
  currentPath,
  onNavigate,
}) => {
  const directories = [
    {
      type: 'BUNDLE' as DirectoryType,
      label: 'Bundle',
      path: NitroFS.BUNDLE_DIR,
    },
    {
      type: 'DOCUMENT' as DirectoryType,
      label: 'Documents',
      path: NitroFS.DOCUMENT_DIR,
    },
    { type: 'CACHE' as DirectoryType, label: 'Cache', path: NitroFS.CACHE_DIR },
    {
      type: 'DOWNLOAD' as DirectoryType,
      label: 'Downloads',
      path: NitroFS.DOWNLOAD_DIR,
    },
  ];

  return (
    <View style={styles.directoryNav}>
      {directories.map(({ type, label, path }) => (
        <TouchableOpacity
          key={type}
          style={[
            styles.dirButton,
            currentPath === path && styles.activeDirButton,
          ]}
          onPress={() => onNavigate(type)}
        >
          <Text
            style={[
              styles.dirButtonText,
              currentPath === path && styles.activeDirButtonText,
            ]}
          >
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  directoryNav: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dirButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  activeDirButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  dirButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  activeDirButtonText: {
    color: '#fff',
  },
});
