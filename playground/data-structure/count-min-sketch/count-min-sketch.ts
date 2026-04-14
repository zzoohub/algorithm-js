// ============================================
// Count-Min Sketch (빈도 추정 자료구조)
// ============================================
// "이 원소가 몇 번 나왔는가?"를 극도로 적은 메모리로 **근사** 추정한다.
// 실제 빈도 이상의 값(과대 추정)만 발생하고, 과소 추정은 없다.
//
// 구조: d개의 행 × w개의 열로 된 2D 카운터 배열.
// 각 행은 서로 다른 해시 함수를 사용.
//
//        열 0   열 1   열 2   열 3   열 4
// 행 0 [  0  |  3  |  0  |  2  |  0  ]  ← hash_0
// 행 1 [  1  |  0  |  3  |  0  |  1  ]  ← hash_1
// 행 2 [  0  |  2  |  0  |  0  |  3  ]  ← hash_2
//
// add("apple"): 각 행에서 해시로 열을 정하고 +1
// query("apple"): 각 행의 해당 열 값 중 최솟값 = 추정 빈도
//
// 최솟값을 취하는 이유:
// 해시 충돌로 다른 원소의 카운트가 섞여 들어올 수 있지만,
// "모든 행에서 동시에 충돌"할 확률은 매우 낮다.
// → 최솟값이 실제 빈도에 가장 가깝다.

class CountMinSketch {
  private table: number[][];
  private width: number;   // 열 수 (w)
  private depth: number;   // 행 수 (d) = 해시 함수 수
  private seeds: number[]; // 각 행의 해시 시드

  // width가 클수록 정확하고, depth가 클수록 오차 확률이 낮다
  // 오차 ε 이내일 확률 ≥ 1 - δ 를 보장하려면:
  //   width = ⌈e/ε⌉, depth = ⌈ln(1/δ)⌉
  constructor(width = 1000, depth = 7) {
    this.width = width;
    this.depth = depth;
    this.table = Array.from({ length: depth }, () => new Array(width).fill(0));
    this.seeds = Array.from({ length: depth }, (_, i) => i * 0x9e3779b9 + 0xdeadbeef);
  }

  // 편의 생성자: 오차 보장으로 생성
  // epsilon: 빈도 추정의 상대 오차 (예: 0.001 = 0.1%)
  // delta: 오차를 초과할 확률 (예: 0.01 = 1%)
  static withAccuracy(epsilon: number, delta: number): CountMinSketch {
    const width = Math.ceil(Math.E / epsilon);
    const depth = Math.ceil(Math.log(1 / delta));
    return new CountMinSketch(width, depth);
  }

  // 원소 추가 (빈도 증가)
  add(value: string, count = 1): void {
    for (let i = 0; i < this.depth; i++) {
      const col = this.hash(value, this.seeds[i]!) % this.width;
      this.table[i]![col]! += count;
    }
  }

  // 빈도 추정: 각 행의 해당 열 값 중 최솟값
  // 실제 빈도 ≤ 반환값 (과대 추정만 가능, 과소 추정 없음)
  query(value: string): number {
    let min = Infinity;
    for (let i = 0; i < this.depth; i++) {
      const col = this.hash(value, this.seeds[i]!) % this.width;
      min = Math.min(min, this.table[i]![col]!);
    }
    return min;
  }

  // 두 스케치 병합 (분산 환경에서 유용)
  merge(other: CountMinSketch): CountMinSketch {
    if (this.width !== other.width || this.depth !== other.depth) {
      throw new Error("크기가 같아야 병합 가능");
    }
    const merged = new CountMinSketch(this.width, this.depth);
    for (let i = 0; i < this.depth; i++) {
      for (let j = 0; j < this.width; j++) {
        merged.table[i]![j] = this.table[i]![j]! + other.table[i]![j]!;
      }
    }
    merged.seeds = [...this.seeds];
    return merged;
  }

  // 사용 메모리 (bytes, 대략)
  get memoryUsage(): number {
    return this.width * this.depth * 8; // 64-bit numbers
  }

  // --- 해시 함수 ---
  private hash(str: string, seed: number): number {
    let h = seed;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x5bd1e995);
      h ^= h >>> 15;
    }
    return h >>> 0;
  }
}

export { CountMinSketch };
