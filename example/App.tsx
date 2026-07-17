import React, { useState } from 'react';
import { StatusBar, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { ActionPanel } from './src/components/action-panel';
import { BenchmarkPage } from './src/components/benchmark-page';
import { DirectoryNavigation } from './src/components/directory-navigation';
import { FileEditor } from './src/components/file-editor';
import { FileList } from './src/components/file-list';
import { Header } from './src/components/header';
import { PathDisplay } from './src/components/path-display';
import { ProgressIndicator } from './src/components/progress-indicator';
import { useFileSystem } from './src/hooks/use-file-system';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

type Tab = 'explorer' | 'benchmark';

const AppContent = () => {
  const [activeTab, setActiveTab] = useState<Tab>('explorer');
  const {
    currentPath,
    files,
    loading,
    uploadProgress,
    downloadProgress,
    selectedFile,
    setSelectedFile,
    createFile,
    createDirectory,
    deleteItem,
    readFile,
    saveFile,
    uploadFile,
    downloadFile,
    navigateToDirectory,
    navigateBack,
    checkExists,
    copyItem,
    renameItem,
    getPathInfo,
    navigateToDirectoryType,
    base64Encoding,
    copyImagesFromDCIMToCache,
    pickDocument,
  } = useFileSystem();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <Header />

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'explorer' && styles.tabActive]}
          onPress={() => setActiveTab('explorer')}
        >
          <Text style={[styles.tabText, activeTab === 'explorer' && styles.tabTextActive]}>
            Explorer
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'benchmark' && styles.tabActive]}
          onPress={() => setActiveTab('benchmark')}
        >
          <Text style={[styles.tabText, activeTab === 'benchmark' && styles.tabTextActive]}>
            Benchmark
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'explorer' ? (
        <>
          <DirectoryNavigation
            currentPath={currentPath}
            onNavigate={navigateToDirectoryType}
          />

          <PathDisplay currentPath={currentPath} onNavigateBack={navigateBack} />

          <ProgressIndicator
            uploadProgress={uploadProgress}
            downloadProgress={downloadProgress}
          />

          <FileList
            files={files}
            loading={loading}
            selectedFile={selectedFile}
            onSelectFile={setSelectedFile}
            onNavigateToDirectory={navigateToDirectory}
            onReadFile={readFile}
            onDeleteFile={deleteItem}
          />

          <ActionPanel
            selectedFile={selectedFile}
            loading={loading}
            onCreateFile={createFile}
            onCreateDirectory={createDirectory}
            onUploadFile={uploadFile}
            onDownloadFile={downloadFile}
            onGetPathInfo={getPathInfo}
            onCheckExists={checkExists}
            onCopyItem={copyItem}
            onRenameItem={renameItem}
            onBase64Encoding={base64Encoding}
            onCopyImagesFromDCIMToCache={copyImagesFromDCIMToCache}
            onPickDocument={pickDocument}
          />

          <FileEditor
            selectedFile={selectedFile}
            loading={loading}
            onSaveFile={saveFile}
            onReadFile={readFile}
          />
        </>
      ) : (
        <BenchmarkPage />
      )}
    </SafeAreaView>
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginVertical: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 10,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
  },
  tabTextActive: {
    color: '#007AFF',
  },
});

export default App;
