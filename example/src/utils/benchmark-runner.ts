export interface MeasureResult {
  avg: number;
  min: number;
  max: number;
  times: number[];
}

export async function measure(
  fn: () => Promise<void>,
  iterations: number,
): Promise<MeasureResult> {
  const times: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    const elapsed = performance.now() - start;
    times.push(elapsed);
  }
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  return { avg, min, max, times };
}

export interface BenchmarkResult {
  nitro: MeasureResult | null;
  expo: MeasureResult | null;
  rnfs: MeasureResult | null;
}

export interface BenchmarkTest {
  id: string;
  name: string;
  iterations: number;
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
  nitro: () => Promise<void>;
  expo: () => Promise<void>;
  rnfs: () => Promise<void>;
}
