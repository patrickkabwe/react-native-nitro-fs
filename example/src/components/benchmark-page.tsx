import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { measure, type BenchmarkResult, type MeasureResult } from '../utils/benchmark-runner';
import { benchmarkTests } from '../utils/benchmark-tests';

type ResultsMap = Record<string, BenchmarkResult>;

export const BenchmarkPage = () => {
  const [results, setResults] = useState<ResultsMap>({});
  const [runningId, setRunningId] = useState<string | null>(null);
  const [runningAll, setRunningAll] = useState(false);

  const runSingle = useCallback(async (testId: string) => {
    const test = benchmarkTests.find(t => t.id === testId);
    if (!test) return;

    setRunningId(testId);

    const result: BenchmarkResult = { nitro: null, expo: null, rnfs: null };

    try {
      if (test.setup) await test.setup();
      result.nitro = await measure(test.nitro, test.iterations);
      if (test.teardown) await test.teardown();

      if (test.setup) await test.setup();
      result.expo = await measure(test.expo, test.iterations);
      if (test.teardown) await test.teardown();

      if (test.setup) await test.setup();
      result.rnfs = await measure(test.rnfs, test.iterations);
      if (test.teardown) await test.teardown();
    } catch (error) {
      console.error(`Benchmark "${test.name}" failed:`, error);
    }

    setResults(prev => ({ ...prev, [testId]: result }));
    setRunningId(null);
  }, []);

  const runAll = useCallback(async () => {
    setRunningAll(true);
    setResults({});

    for (const test of benchmarkTests) {
      setRunningId(test.id);
      const result: BenchmarkResult = { nitro: null, expo: null, rnfs: null };

      try {
        if (test.setup) await test.setup();
        result.nitro = await measure(test.nitro, test.iterations);
        if (test.teardown) await test.teardown();

        if (test.setup) await test.setup();
        result.expo = await measure(test.expo, test.iterations);
        if (test.teardown) await test.teardown();

        if (test.setup) await test.setup();
        result.rnfs = await measure(test.rnfs, test.iterations);
        if (test.teardown) await test.teardown();
      } catch (error) {
        console.error(`Benchmark "${test.name}" failed:`, error);
      }

      setResults(prev => ({ ...prev, [test.id]: result }));
    }

    setRunningId(null);
    setRunningAll(false);
  }, []);

  const formatMs = (ms: number | undefined) => {
    if (ms === undefined || ms === null) return '-';
    if (ms < 1) return `${(ms * 1000).toFixed(0)}us`;
    if (ms < 100) return `${ms.toFixed(2)}ms`;
    return `${ms.toFixed(0)}ms`;
  };

  const getSpeedup = (r: BenchmarkResult, lib: 'nitro' | 'expo' | 'rnfs'): string | null => {
    const avgs: number[] = [];
    if (r.nitro) avgs.push(r.nitro.avg);
    if (r.expo) avgs.push(r.expo.avg);
    if (r.rnfs) avgs.push(r.rnfs.avg);
    if (avgs.length < 2) return null;

    const thisAvg = r[lib]?.avg;
    if (!thisAvg) return null;

    const slowest = Math.max(...avgs);
    if (thisAvg >= slowest) return null;

    const ratio = slowest / thisAvg;
    if (ratio < 1.05) return null;
    return `${ratio.toFixed(1)}x`;
  };

  const getFastestLib = (r: BenchmarkResult): 'nitro' | 'expo' | 'rnfs' | null => {
    const vals: { lib: 'nitro' | 'expo' | 'rnfs'; avg: number }[] = [];
    if (r.nitro) vals.push({ lib: 'nitro', avg: r.nitro.avg });
    if (r.expo) vals.push({ lib: 'expo', avg: r.expo.avg });
    if (r.rnfs) vals.push({ lib: 'rnfs', avg: r.rnfs.avg });
    if (vals.length === 0) return null;
    vals.sort((a, b) => a.avg - b.avg);
    return vals[0].lib;
  };

  const renderCell = (
    result: MeasureResult | null,
    fastest: 'nitro' | 'expo' | 'rnfs' | null,
    lib: 'nitro' | 'expo' | 'rnfs',
    benchmarkResult: BenchmarkResult | undefined,
  ) => {
    const isFastest = fastest === lib;
    const speedup = benchmarkResult ? getSpeedup(benchmarkResult, lib) : null;
    return (
      <View style={[styles.cell, isFastest && styles.fastestCell]}>
        <Text style={[styles.cellText, isFastest && styles.fastestText]}>
          {result ? formatMs(result.avg) : '-'}
        </Text>
        {speedup && (
          <Text style={[styles.speedupText, isFastest && styles.speedupTextFastest]}>
            {speedup}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>FS Benchmarks</Text>
        <Text style={styles.subtitle}>{benchmarkTests[0]?.iterations} iterations avg</Text>
      </View>

      <TouchableOpacity
        style={[styles.runAllButton, runningAll && styles.runAllButtonDisabled]}
        onPress={runAll}
        disabled={runningAll || runningId !== null}
      >
        {runningAll ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.runAllText}>Run All Benchmarks</Text>
        )}
      </TouchableOpacity>

      {/* Table header */}
      <View style={styles.tableHeader}>
        <View style={styles.testNameHeader}>
          <Text style={styles.headerText}>Test</Text>
        </View>
        <View style={styles.cell}>
          <Text style={styles.headerText}>NitroFS</Text>
        </View>
        <View style={styles.cell}>
          <Text style={styles.headerText}>ExpoFS</Text>
        </View>
        <View style={styles.cell}>
          <Text style={styles.headerText}>RNFS</Text>
        </View>
        <View style={styles.actionCell}>
          <Text style={styles.headerText} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {benchmarkTests.map(test => {
          const r = results[test.id];
          const fastest = r ? getFastestLib(r) : null;
          const isRunning = runningId === test.id;

          return (
            <View key={test.id} style={styles.row}>
              <View style={styles.testNameCell}>
                <Text style={styles.testName} numberOfLines={2}>
                  {test.name}
                </Text>
              </View>

              {isRunning ? (
                <View style={styles.runningRow}>
                  <ActivityIndicator size="small" color="#007AFF" />
                  <Text style={styles.runningText}>Running...</Text>
                </View>
              ) : (
                <>
                  {renderCell(r?.nitro ?? null, fastest, 'nitro', r)}
                  {renderCell(r?.expo ?? null, fastest, 'expo', r)}
                  {renderCell(r?.rnfs ?? null, fastest, 'rnfs', r)}
                </>
              )}

              <TouchableOpacity
                style={styles.runButton}
                onPress={() => runSingle(test.id)}
                disabled={runningAll || runningId !== null}
              >
                <Text style={styles.runButtonText}>Run</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
  },
  runAllButton: {
    backgroundColor: '#007AFF',
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  runAllButtonDisabled: {
    opacity: 0.6,
  },
  runAllText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#e9ecef',
    marginHorizontal: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#495057',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    marginHorizontal: 8,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#dee2e6',
    backgroundColor: '#fff',
  },
  testNameHeader: {
    flex: 1.2,
  },
  testNameCell: {
    flex: 1.2,
  },
  testName: {
    fontSize: 12,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
  },
  cellText: {
    fontSize: 12,
    color: '#495057',
    fontFamily: 'Menlo',
  },
  speedupText: {
    fontSize: 9,
    color: '#6c757d',
    fontWeight: '600',
    marginTop: 1,
  },
  speedupTextFastest: {
    color: '#155724',
  },
  fastestCell: {
    backgroundColor: '#d4edda',
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  fastestText: {
    color: '#155724',
    fontWeight: '700',
  },
  actionCell: {
    width: 44,
  },
  runButton: {
    width: 44,
    paddingVertical: 4,
    paddingHorizontal: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 6,
    alignItems: 'center',
  },
  runButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#495057',
  },
  runningRow: {
    flex: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  runningText: {
    fontSize: 12,
    color: '#007AFF',
  },
});
