import React, {useEffect, useState} from 'react';
import {Button, Platform, StyleSheet, Text, View} from 'react-native';
import {NitroFS, type NitroFileStat} from 'react-native-nitro-fs';

const uploadURL = Platform.select({
  ios: 'http://localhost:5100/upload',
  android: 'http://10.0.2.2:5100/upload',
  default: 'http://localhost:5100/upload',
});

const fileToUpload = Platform.select({
  ios: NitroFS.DOCUMENT_DIR + '/test1.txt',
  android: NitroFS.DOCUMENT_DIR + '/text.txt',
  default: NitroFS.DOCUMENT_DIR + '/test1.txt',
});

function App(): React.JSX.Element {
  const [exists, setExists] = useState(false);
  const [stat, setStat] = useState<NitroFileStat | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    console.log('NitroFS.DOCUMENT_DIR', NitroFS.DOCUMENT_DIR);

    NitroFS.exists(NitroFS.DOCUMENT_DIR).then(exists => {
      console.log('exists ' + Platform.OS, exists);

      setExists(exists);
    });

    NitroFS.stat(NitroFS.DOCUMENT_DIR + '/test1.txt').then(stat => {
      setStat(stat);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{exists ? 'Exists' : 'Does not exist'}</Text>
      <Button
        title="Read File"
        onPress={() => {
          NitroFS.readFile(fileToUpload, 'utf8')
            .then(data => {
              console.log(data);
            })
            .catch(err => {
              console.log(err);
            });
        }}
      />
      <Button
        title="Create File"
        onPress={() => {
          NitroFS.writeFile(
            fileToUpload,
            'Hello, world! some more text',
            'utf8',
          )
            .then(() => {
              console.log('File created');
            })
            .catch(err => {
              console.log(err);
            });
        }}
      />

      <Button
        title="Copy File"
        onPress={() => {
            console.log(NitroFS.DOCUMENT_DIR + `/testDir/test${Date.now()}.txt`,);
            
          NitroFS.copy(
            fileToUpload,
            NitroFS.DOCUMENT_DIR + `/testDir/test${Date.now()}.txt`,
          )
            .then(() => {
              console.log('File copied');
            })
            .catch(err => {
              console.log(err);
            });
        }}
      />

      <Button
        title="Delete File  "
        onPress={() => {
          NitroFS.unlink(fileToUpload).then(() => {
            console.log('File unlinked');
          });
        }}
      />

      <Button
        title="Create Directory"
        onPress={() => {
          NitroFS.mkdir(NitroFS.DOCUMENT_DIR + '/testDir').then(() => {
            console.log('Directory created');
          });
        }}
      />

      <Button
        title="Upload File"
        onPress={() => {
          NitroFS.uploadFile(
            {
              name: 'test.txt',
              mimeType: 'text/plain',
              path: fileToUpload,
            },
            {url: uploadURL, method: 'POST'},
            (uploadedBytes, totalBytes) => {
              const progress = (uploadedBytes / totalBytes) * 100;              
              setUploadProgress(Math.round(progress));
            },
          )
            .then(() => {
              console.log('File uploaded');
            })
            .catch(err => {
              console.log(err);
            });
        }}
      />

      <Button
        title="Download File"
        disabled={downloadProgress !== 100 && downloadProgress !== 0}
        onPress={() => {
          NitroFS.downloadFile(
            uploadURL,
            'dummyfile.zip',
            NitroFS.DOWNLOAD_DIR + '/dummyfile.zip',
            (downloadedBytes, totalBytes) => {
              const progress = (downloadedBytes / totalBytes) * 100;
              setDownloadProgress(Math.round(progress));
              console.log(progress);
            },
          )
            .then(file => {
              console.log('File downloaded', file);
            })
            .catch(err => {
              console.log(err);
            });
        }}
      />
      <View>
        <Text>File Stat</Text>
        <Text>size: {stat?.size} bytes</Text>
        <Text>mtime: {stat?.mtime} seconds</Text>
        <Text>ctime: {stat?.ctime} seconds</Text>
        <Text>isFile: {stat?.isFile ? 'true' : 'false'}</Text>
        <Text>isDirectory: {stat?.isDirectory ? 'true' : 'false'}</Text>
      </View>

      <Text>Upload Progress: {uploadProgress}%</Text>
      <Text>Download Progress: {downloadProgress}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 40,
    color: 'green',
  },
});

export default App;
