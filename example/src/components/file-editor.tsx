import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { FileItem } from '../types';

interface FileEditorProps {
  selectedFile: FileItem | null;
  loading: boolean;
  onSaveFile: (content: string) => void;
  onReadFile: (file: FileItem) => void;
  onFileContentReceived?: (content: string) => void;
}

export const FileEditor: React.FC<FileEditorProps> = ({
  selectedFile,
  loading,
  onSaveFile,
  onReadFile,
  onFileContentReceived,
}) => {
  const [fileContent, setFileContent] = useState('');

  useEffect(() => {
    if (selectedFile && !selectedFile.isDirectory) {
      // Reset content when file changes
      setFileContent('');
      onReadFile(selectedFile);
    }
  }, [selectedFile]);

  const handleSave = () => {
    onSaveFile(fileContent);
  };

  if (!selectedFile || selectedFile.isDirectory) {
    return null;
  }

  return (
    <View style={styles.editorContainer}>
      <View style={styles.editorHeader}>
        <Text style={styles.editorTitle}>Editing: {selectedFile.name}</Text>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.editor}
        value={fileContent}
        onChangeText={setFileContent}
        multiline
        placeholder="File content..."
        placeholderTextColor="#999"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  editorContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  editorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveButton: {
    backgroundColor: '#28a745',
    marginLeft: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  editor: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: '#f8f9fa',
  },
});
