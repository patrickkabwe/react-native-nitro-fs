import NitroFS from 'react-native-nitro-fs';
import { File, Directory, Paths } from 'expo-file-system';
import {
  CachesDirectoryPath,
  writeFile as rnfsWriteFile,
  readFile as rnfsReadFile,
  exists as rnfsExists,
  mkdir as rnfsMkdir,
  unlink as rnfsUnlink,
  stat as rnfsStat,
  copyFile as rnfsCopyFile,
  moveFile as rnfsMoveFile,
  readDir as rnfsReadDir,
} from '@dr.pogodin/react-native-fs';
import type { BenchmarkTest } from './benchmark-runner';

const ITERATIONS = 50;

function generateData(sizeBytes: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < sizeBytes; i++) {
    result += chars.charAt(i % chars.length);
  }
  return result;
}

const SMALL_DATA = generateData(1024);         // 1KB
const MEDIUM_DATA = generateData(100 * 1024);  // 100KB
const LARGE_DATA = generateData(1024 * 1024);  // 1MB

const BASE64_DATA = 'SGVsbG8gV29ybGQhIFRoaXMgaXMgYSBiYXNlNjQgYmVuY2htYXJrIHRlc3Qu';

// Workspace paths
const nitroWorkspace = () => `${NitroFS.CACHE_DIR}/benchmark_workspace`;
const expoWorkspace = () => new Directory(Paths.cache, 'benchmark_workspace_expo');
const rnfsWorkspaceDir = () => `${CachesDirectoryPath}/benchmark_workspace_rnfs`;

async function ensureWorkspaces() {
  const nitroDir = nitroWorkspace();
  if (!(await NitroFS.exists(nitroDir))) {
    await NitroFS.mkdir(nitroDir);
  }
  const expoDir = expoWorkspace();
  if (!expoDir.exists) {
    expoDir.create({ intermediates: true });
  }
  const rnfsDir = rnfsWorkspaceDir();
  if (!(await rnfsExists(rnfsDir))) {
    await rnfsMkdir(rnfsDir);
  }
}

async function cleanWorkspaces() {
  try { await NitroFS.unlink(nitroWorkspace()); } catch {}
  try { const d = expoWorkspace(); if (d.exists) { d.delete(); } } catch {}
  try { await rnfsUnlink(rnfsWorkspaceDir()); } catch {}
}

let counter = 0;
function uniqueName(prefix: string, ext: string = 'txt') {
  return `${prefix}_${Date.now()}_${counter++}.${ext}`;
}

function createWriteTest(label: string, data: string, iterations: number): BenchmarkTest {
  return {
    id: `write_${label}`,
    name: `Write ${label}`,
    iterations,
    setup: ensureWorkspaces,
    teardown: cleanWorkspaces,
    nitro: async () => {
      const path = `${nitroWorkspace()}/${uniqueName('write')}`;
      await NitroFS.writeFile(path, data, 'utf8');
    },
    expo: async () => {
      const file = new File(expoWorkspace(), uniqueName('write'));
      file.create();
      file.write(data);
    },
    rnfs: async () => {
      const path = `${rnfsWorkspaceDir()}/${uniqueName('write')}`;
      await rnfsWriteFile(path, data, 'utf8');
    },
  };
}

function createReadTest(label: string, data: string, iterations: number): BenchmarkTest {
  const nitroPath = () => `${nitroWorkspace()}/read_fixture_${label}.txt`;
  const expoFile = () => new File(expoWorkspace(), `read_fixture_${label}.txt`);
  const rnfsPath = () => `${rnfsWorkspaceDir()}/read_fixture_${label}.txt`;

  return {
    id: `read_${label}`,
    name: `Read ${label}`,
    iterations,
    setup: async () => {
      await ensureWorkspaces();
      await NitroFS.writeFile(nitroPath(), data, 'utf8');
      const ef = expoFile();
      ef.create({ overwrite: true });
      ef.write(data);
      await rnfsWriteFile(rnfsPath(), data, 'utf8');
    },
    teardown: cleanWorkspaces,
    nitro: async () => {
      await NitroFS.readFile(nitroPath(), 'utf8');
    },
    expo: async () => {
      await expoFile().text();
    },
    rnfs: async () => {
      await rnfsReadFile(rnfsPath(), 'utf8');
    },
  };
}

export const benchmarkTests: BenchmarkTest[] = [
  // Write tests
  createWriteTest('1KB', SMALL_DATA, ITERATIONS),
  createWriteTest('100KB', MEDIUM_DATA, ITERATIONS),
  createWriteTest('1MB', LARGE_DATA, ITERATIONS),

  // Read tests
  createReadTest('1KB', SMALL_DATA, ITERATIONS),
  createReadTest('100KB', MEDIUM_DATA, ITERATIONS),
  createReadTest('1MB', LARGE_DATA, ITERATIONS),

  // File exists
  {
    id: 'exists',
    name: 'File Exists',
    iterations: ITERATIONS,
    setup: async () => {
      await ensureWorkspaces();
      await NitroFS.writeFile(`${nitroWorkspace()}/exists_test.txt`, 'test', 'utf8');
      const ef = new File(expoWorkspace(), 'exists_test.txt');
      ef.create({ overwrite: true });
      ef.write('test');
      await rnfsWriteFile(`${rnfsWorkspaceDir()}/exists_test.txt`, 'test', 'utf8');
    },
    teardown: cleanWorkspaces,
    nitro: async () => {
      await NitroFS.exists(`${nitroWorkspace()}/exists_test.txt`);
    },
    expo: async () => {
       new File(expoWorkspace(), 'exists_test.txt').exists;
    },
    rnfs: async () => {
      await rnfsExists(`${rnfsWorkspaceDir()}/exists_test.txt`);
    },
  },

  // File stat
  {
    id: 'stat',
    name: 'File Stat',
    iterations: ITERATIONS,
    setup: async () => {
      await ensureWorkspaces();
      await NitroFS.writeFile(`${nitroWorkspace()}/stat_test.txt`, MEDIUM_DATA, 'utf8');
      const ef = new File(expoWorkspace(), 'stat_test.txt');
      ef.create({ overwrite: true });
      ef.write(MEDIUM_DATA);
      await rnfsWriteFile(`${rnfsWorkspaceDir()}/stat_test.txt`, MEDIUM_DATA, 'utf8');
    },
    teardown: cleanWorkspaces,
    nitro: async () => {
      await NitroFS.stat(`${nitroWorkspace()}/stat_test.txt`);
    },
    expo: async () => {
      new File(expoWorkspace(), 'stat_test.txt').info();
    },
    rnfs: async () => {
      await rnfsStat(`${rnfsWorkspaceDir()}/stat_test.txt`);
    },
  },

  // Create + delete file
  {
    id: 'create_delete_file',
    name: 'Create + Delete File',
    iterations: ITERATIONS,
    setup: ensureWorkspaces,
    teardown: cleanWorkspaces,
    nitro: async () => {
      const path = `${nitroWorkspace()}/${uniqueName('cd')}`;
      await NitroFS.writeFile(path, 'temp', 'utf8');
      await NitroFS.unlink(path);
    },
    expo: async () => {
      const file = new File(expoWorkspace(), uniqueName('cd'));
      file.create();
      file.delete();
    },
    rnfs: async () => {
      const path = `${rnfsWorkspaceDir()}/${uniqueName('cd')}`;
      await rnfsWriteFile(path, 'temp', 'utf8');
      await rnfsUnlink(path);
    },
  },

  // Create + delete directory
  {
    id: 'create_delete_dir',
    name: 'Create + Delete Dir',
    iterations: ITERATIONS,
    setup: ensureWorkspaces,
    teardown: cleanWorkspaces,
    nitro: async () => {
      const path = `${nitroWorkspace()}/${uniqueName('dir')}`;
      await NitroFS.mkdir(path);
      await NitroFS.unlink(path);
    },
    expo: async () => {
      const dir = new Directory(expoWorkspace(), uniqueName('dir'));
      dir.create();
      dir.delete();
    },
    rnfs: async () => {
      const path = `${rnfsWorkspaceDir()}/${uniqueName('dir')}`;
      await rnfsMkdir(path);
      await rnfsUnlink(path);
    },
  },

  // Copy file (100KB)
  {
    id: 'copy_file',
    name: 'Copy File (100KB)',
    iterations: ITERATIONS,
    setup: async () => {
      await ensureWorkspaces();
      await NitroFS.writeFile(`${nitroWorkspace()}/copy_src.txt`, MEDIUM_DATA, 'utf8');
      const ef = new File(expoWorkspace(), 'copy_src.txt');
      ef.create({ overwrite: true });
      ef.write(MEDIUM_DATA);
      await rnfsWriteFile(`${rnfsWorkspaceDir()}/copy_src.txt`, MEDIUM_DATA, 'utf8');
    },
    teardown: cleanWorkspaces,
    nitro: async () => {
      const dest = `${nitroWorkspace()}/${uniqueName('copy_dest')}`;
      await NitroFS.copyFile(`${nitroWorkspace()}/copy_src.txt`, dest);
    },
    expo: async () => {
      const src = new File(expoWorkspace(), 'copy_src.txt');
      const dest = new File(expoWorkspace(), uniqueName('copy_dest'));
      src.copy(dest);
    },
    rnfs: async () => {
      const dest = `${rnfsWorkspaceDir()}/${uniqueName('copy_dest')}`;
      await rnfsCopyFile(`${rnfsWorkspaceDir()}/copy_src.txt`, dest);
    },
  },

  // Rename / move file
  {
    id: 'rename_file',
    name: 'Rename File',
    iterations: ITERATIONS,
    setup: ensureWorkspaces,
    teardown: cleanWorkspaces,
    nitro: async () => {
      const name = uniqueName('rename_src');
      const srcPath = `${nitroWorkspace()}/${name}`;
      const destPath = `${nitroWorkspace()}/${uniqueName('rename_dest')}`;
      await NitroFS.writeFile(srcPath, 'temp', 'utf8');
      await NitroFS.rename(srcPath, destPath);
    },
    expo: async () => {
      const srcName = uniqueName('rename_src');
      const file = new File(expoWorkspace(), srcName);
      file.create();
      file.write('temp');
      file.move(new File(expoWorkspace(), uniqueName('rename_dest')));
    },
    rnfs: async () => {
      const name = uniqueName('rename_src');
      const srcPath = `${rnfsWorkspaceDir()}/${name}`;
      const destPath = `${rnfsWorkspaceDir()}/${uniqueName('rename_dest')}`;
      await rnfsWriteFile(srcPath, 'temp', 'utf8');
      await rnfsMoveFile(srcPath, destPath);
    },
  },

  // Read directory
  {
    id: 'readdir',
    name: 'Read Directory',
    iterations: ITERATIONS,
    setup: async () => {
      await ensureWorkspaces();
      for (let i = 0; i < 20; i++) {
        await NitroFS.writeFile(`${nitroWorkspace()}/dir_file_${i}.txt`, 'content', 'utf8');
        const ef = new File(expoWorkspace(), `dir_file_${i}.txt`);
        ef.create({ overwrite: true });
        ef.write('content');
        await rnfsWriteFile(`${rnfsWorkspaceDir()}/dir_file_${i}.txt`, 'content', 'utf8');
      }
    },
    teardown: cleanWorkspaces,
    nitro: async () => {
      await NitroFS.readdir(nitroWorkspace());
    },
    expo: async () => {
      expoWorkspace().list();
    },
    rnfs: async () => {
      await rnfsReadDir(rnfsWorkspaceDir());
    },
  },

  // Base64 write + read
  {
    id: 'base64',
    name: 'Base64 Write+Read',
    iterations: ITERATIONS,
    setup: ensureWorkspaces,
    teardown: cleanWorkspaces,
    nitro: async () => {
      const path = `${nitroWorkspace()}/${uniqueName('b64')}.bin`;
      await NitroFS.writeFile(path, BASE64_DATA, 'base64');
      await NitroFS.readFile(path, 'base64');
    },
    expo: async () => {
      const file = new File(expoWorkspace(), `${uniqueName('b64')}.bin`);
      file.create();
      file.write(BASE64_DATA);
      await file.base64();
    },
    rnfs: async () => {
      const path = `${rnfsWorkspaceDir()}/${uniqueName('b64')}.bin`;
      await rnfsWriteFile(path, BASE64_DATA, 'base64');
      await rnfsReadFile(path, 'base64');
    },
  },

  // === Parallel / Concurrent tests (Nitro's strength: thread pool vs RNFS serial queue) ===

  // Parallel writes — 10 concurrent file writes
  {
    id: 'parallel_write',
    name: 'Parallel Write x10',
    iterations: ITERATIONS,
    setup: ensureWorkspaces,
    teardown: cleanWorkspaces,
    nitro: async () => {
      const promises = Array.from({ length: 10 }, (_, i) => {
        const path = `${nitroWorkspace()}/${uniqueName(`pw_${i}`)}`;
        return NitroFS.writeFile(path, SMALL_DATA, 'utf8');
      });
      await Promise.all(promises);
    },
    expo: async () => {
      for (let i = 0; i < 10; i++) {
        const file = new File(expoWorkspace(), uniqueName(`pw_${i}`));
        file.create();
        file.write(SMALL_DATA);
      }
    },
    rnfs: async () => {
      const promises = Array.from({ length: 10 }, (_, i) => {
        const path = `${rnfsWorkspaceDir()}/${uniqueName(`pw_${i}`)}`;
        return rnfsWriteFile(path, SMALL_DATA, 'utf8');
      });
      await Promise.all(promises);
    },
  },

  // Parallel reads — 10 concurrent file reads
  {
    id: 'parallel_read',
    name: 'Parallel Read x10',
    iterations: ITERATIONS,
    setup: async () => {
      await ensureWorkspaces();
      for (let i = 0; i < 10; i++) {
        await NitroFS.writeFile(`${nitroWorkspace()}/pr_${i}.txt`, MEDIUM_DATA, 'utf8');
        const ef = new File(expoWorkspace(), `pr_${i}.txt`);
        ef.create({ overwrite: true });
        ef.write(MEDIUM_DATA);
        await rnfsWriteFile(`${rnfsWorkspaceDir()}/pr_${i}.txt`, MEDIUM_DATA, 'utf8');
      }
    },
    teardown: cleanWorkspaces,
    nitro: async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        NitroFS.readFile(`${nitroWorkspace()}/pr_${i}.txt`, 'utf8')
      );
      await Promise.all(promises);
    },
    expo: async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        new File(expoWorkspace(), `pr_${i}.txt`).text()
      );
      await Promise.all(promises);
    },
    rnfs: async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        rnfsReadFile(`${rnfsWorkspaceDir()}/pr_${i}.txt`, 'utf8')
      );
      await Promise.all(promises);
    },
  },

  // Parallel mixed ops — write + stat + read + exists concurrently
  {
    id: 'parallel_mixed',
    name: 'Parallel Mixed Ops',
    iterations: ITERATIONS,
    setup: async () => {
      await ensureWorkspaces();
      await NitroFS.writeFile(`${nitroWorkspace()}/mixed_fixture.txt`, MEDIUM_DATA, 'utf8');
      const ef = new File(expoWorkspace(), 'mixed_fixture.txt');
      ef.create({ overwrite: true });
      ef.write(MEDIUM_DATA);
      await rnfsWriteFile(`${rnfsWorkspaceDir()}/mixed_fixture.txt`, MEDIUM_DATA, 'utf8');
    },
    teardown: cleanWorkspaces,
    nitro: async () => {
      const ws = nitroWorkspace();
      await Promise.all([
        NitroFS.writeFile(`${ws}/${uniqueName('mix_w')}`, SMALL_DATA, 'utf8'),
        NitroFS.stat(`${ws}/mixed_fixture.txt`),
        NitroFS.readFile(`${ws}/mixed_fixture.txt`, 'utf8'),
        NitroFS.exists(`${ws}/mixed_fixture.txt`),
        NitroFS.writeFile(`${ws}/${uniqueName('mix_w2')}`, SMALL_DATA, 'utf8'),
      ]);
    },
    expo: async () => {
      const ws = expoWorkspace();
      const fixture = new File(ws, 'mixed_fixture.txt');
      const f1 = new File(ws, uniqueName('mix_w'));
      f1.create();
      f1.write(SMALL_DATA);
      fixture.info();
      await fixture.text();
      fixture.exists;
      const f2 = new File(ws, uniqueName('mix_w2'));
      f2.create();
      f2.write(SMALL_DATA);
    },
    rnfs: async () => {
      const ws = rnfsWorkspaceDir();
      await Promise.all([
        rnfsWriteFile(`${ws}/${uniqueName('mix_w')}`, SMALL_DATA, 'utf8'),
        rnfsStat(`${ws}/mixed_fixture.txt`),
        rnfsReadFile(`${ws}/mixed_fixture.txt`, 'utf8'),
        rnfsExists(`${ws}/mixed_fixture.txt`),
        rnfsWriteFile(`${ws}/${uniqueName('mix_w2')}`, SMALL_DATA, 'utf8'),
      ]);
    },
  },

  // Rapid sequential small writes — 50 tiny files in sequence
  {
    id: 'rapid_writes',
    name: 'Rapid 50 Writes',
    iterations: Math.floor(ITERATIONS / 5),
    setup: ensureWorkspaces,
    teardown: cleanWorkspaces,
    nitro: async () => {
      for (let i = 0; i < 50; i++) {
        await NitroFS.writeFile(`${nitroWorkspace()}/${uniqueName('rw')}`, 'x', 'utf8');
      }
    },
    expo: async () => {
      for (let i = 0; i < 50; i++) {
        const f = new File(expoWorkspace(), uniqueName('rw'));
        f.create();
        f.write('x');
      }
    },
    rnfs: async () => {
      for (let i = 0; i < 50; i++) {
        await rnfsWriteFile(`${rnfsWorkspaceDir()}/${uniqueName('rw')}`, 'x', 'utf8');
      }
    },
  },

  // Sync path ops (Nitro-exclusive: synchronous JSI calls, no async overhead)
  {
    id: 'sync_path_ops',
    name: 'Sync Path Ops x100',
    iterations: ITERATIONS,
    setup: async () => {},
    teardown: async () => {},
    nitro: async () => {
      const testPath = '/var/mobile/Containers/Data/Application/ABC123/Documents/photos/vacation/IMG_1234.jpg';
      for (let i = 0; i < 100; i++) {
        NitroFS.dirname(testPath);
        NitroFS.basename(testPath);
        NitroFS.extname(testPath);
      }
    },
    expo: async () => {
      const testPath = '/var/mobile/Containers/Data/Application/ABC123/Documents/photos/vacation/IMG_1234.jpg';
      for (let i = 0; i < 100; i++) {
        Paths.dirname(testPath);
        Paths.basename(testPath);
        Paths.extname(testPath);
      }
    },
    rnfs: async () => {
      // RNFS has no path utilities — use JS string operations as baseline
      const testPath = '/var/mobile/Containers/Data/Application/ABC123/Documents/photos/vacation/IMG_1234.jpg';
      for (let i = 0; i < 100; i++) {
        testPath.substring(0, testPath.lastIndexOf('/'));
        testPath.substring(testPath.lastIndexOf('/') + 1);
        testPath.substring(testPath.lastIndexOf('.'));
      }
    },
  },
];
