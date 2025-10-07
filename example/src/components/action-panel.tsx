import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { FileItem } from '../types';

interface ActionPanelProps {
  selectedFile: FileItem | null;
  loading: boolean;
  onCreateFile: (fileName: string, content: string) => void;
  onCreateDirectory: (dirName: string) => void;
  onUploadFile: () => void;
  onDownloadFile: () => void;
  onGetPathInfo: (path: string) => void;
  onCheckExists: (path: string) => void;
  onCopyItem: (item: FileItem, newName: string) => void;
  onRenameItem: (item: FileItem, newName: string) => void;
  onBase64Encoding: () => void;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({
  selectedFile,
  loading,
  onCreateFile,
  onCreateDirectory,
  onUploadFile,
  onDownloadFile,
  onGetPathInfo,
  onCheckExists,
  onCopyItem,
  onRenameItem,
  onBase64Encoding,
}) => {
  const [fileName, setFileName] = useState('');
  const [fileContent, setFileContent] = useState('');

  const handleCreateFile = () => {
    onCreateFile(fileName, fileContent);
    setFileName('');
    setFileContent('');
  };

  const handleCreateDirectory = () => {
    onCreateDirectory(fileName);
    setFileName('');
  };

  const handleCopyItem = () => {
    if (selectedFile) {
      onCopyItem(selectedFile, fileName);
      setFileName('');
    }
  };

  const handleRenameItem = () => {
    if (selectedFile) {
      onRenameItem(selectedFile, fileName);
      setFileName('');
    }
  };

  return (
    <View style={styles.actionContainer}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="File/Directory name"
          value={fileName}
          onChangeText={setFileName}
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.createButton]}
          onPress={handleCreateFile}
        >
          <Text style={styles.buttonText}>Create File</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.createButton]}
          onPress={handleCreateDirectory}
        >
          <Text style={styles.buttonText}>Create Dir</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.uploadButton, { opacity: loading ? 0.5 : 1 }]}
          onPress={onUploadFile}
          disabled={!selectedFile || loading}
        >
          <Text style={styles.buttonText}>Upload File</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.downloadButton, { opacity: loading ? 0.5 : 1 }]}
          onPress={onDownloadFile}
          disabled={!selectedFile || loading}
        >
          <Text style={styles.buttonText}>Download File</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.infoButton]}
          onPress={() => selectedFile && onGetPathInfo(selectedFile.path)}
          disabled={!selectedFile}
        >
          <Text style={styles.buttonText}>Path Info</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.infoButton]}
          onPress={() => selectedFile && onCheckExists(selectedFile.path)}
          disabled={!selectedFile}
        >
          <Text style={styles.buttonText}>Check Exists</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.copyButton]}
          onPress={handleCopyItem}
          disabled={!selectedFile || !fileName.trim()}
        >
          <Text style={styles.buttonText}>Copy Item</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.renameButton]}
          onPress={handleRenameItem}
          disabled={!selectedFile || !fileName.trim()}
        >
          <Text style={styles.buttonText}>Rename Item</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.base64Button]}
          onPress={onBase64Encoding}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Base64</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  actionContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  inputContainer: {
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  createButton: {
    backgroundColor: '#007AFF',
  },
  uploadButton: {
    backgroundColor: '#28a745',
  },
  downloadButton: {
    backgroundColor: '#ffc107',
  },
  infoButton: {
    backgroundColor: '#17a2b8',
  },
  copyButton: {
    backgroundColor: '#6f42c1',
  },
  renameButton: {
    backgroundColor: '#fd7e14',
  },
  base64Button: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
