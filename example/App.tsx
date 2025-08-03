import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { ActionPanel } from './src/components/action-panel';
import { DirectoryNavigation } from './src/components/directory-navigation';
import { FileEditor } from './src/components/file-editor';
import { FileList } from './src/components/file-list';
import { Header } from './src/components/header';
import { PathDisplay } from './src/components/path-display';
import { ProgressIndicator } from './src/components/progress-indicator';
import { useFileSystem } from './src/hooks/use-file-system';

const App = () => {
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
  } = useFileSystem();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <Header />

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
      />

      <FileEditor
        selectedFile={selectedFile}
        loading={loading}
        onSaveFile={saveFile}
        onReadFile={readFile}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});

export default App;
