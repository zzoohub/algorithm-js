// ============================================
// HyperLogLog (초확률적 카디널리티 추정)
// ============================================
// "고유 원소가 몇 개인가?"를 극도로 적은 메모리로 **근사** 추정한다.
// 10억 개의 고유 값을 세는 데 정확한 방법(HashSet)은 수 GB가 필요하지만,
// HyperLogLog는 약 12KB로 2% 이내의 오차를 달성한다.
//
// 핵심 직관:
// 해시값을 이진수로 봤을 때, 앞에 0이 많이 나올수록 "운이 좋은" 것.
// 0이 k개 연속으로 나올 확률은 1/2^k.
// 따라서 관측된 최대 연속 0의 수로 고유 원소 수를 추정할 수 있다.
//
// 예) 최대 5개의 연속 0을 관찰했다면, 대략 2^5 = 32개의 고유 원소가 있다고 추정.
//
// 하지만 하나의 관측은 분산이 크다.
// → 여러 개의 "버킷(레지스터)"으로 나눠서 관측하고, 조화평균으로 합친다.

class HyperLogLog {
  private registers: Uint8Array;
  private m: number;          // 레지스터(버킷) 수 = 2^precision
  private precision: number;  // 정밀도 비트 수 (보통 4~16)
  private alphaMM: number;    // 보정 상수 * m^2

  // precision = 14면 레지스터 16384개, 메모리 ~12KB, 오차율 ~0.81%
  constructor(precision = 14) {
    this.precision = precision;
    this.m = 1 << precision;  // 2^precision
    this.registers = new Uint8Array(this.m);

    // alpha: 보정 상수 (조화평균의 편향 보정)
    let alpha: number;
    if (this.m === 16) alpha = 0.673;
    else if (this.m === 32) alpha = 0.697;
    else if (this.m === 64) alpha = 0.709;
    else alpha = 0.7213 / (1 + 1.079 / this.m);

    this.alphaMM = alpha * this.m * this.m;
  }

  // 원소 추가
  add(value: string): void {
    const hash = this.hash(value);

    // 상위 precision비트 → 버킷 번호 (16384개 중 하나)
    // 나머지 비트 → 연속 0 카운트 대상
    const bucket = hash >>> (32 - this.precision);
    const remaining = (hash << this.precision) | (1 << (this.precision - 1));

    // 나머지 비트에서 연속 0 카운트 = "동전 던지기" 시뮬레이션
    // 연속 0의 수 + 1 (leading zeros of remaining bits)
    const zeros = Math.clz32(remaining) + 1;

    // 더 "운 좋은"(연속 0이 더 많은) 관측만 기록
    if (zeros > this.registers[bucket]!) {
      this.registers[bucket] = zeros;
    }
  }

  // 카디널리티 추정
  count(): number {
    // 조화평균: 1 / (Σ 2^(-register[i]))
    let harmonicSum = 0;
    let zeroRegisters = 0;

    for (let i = 0; i < this.m; i++) {
      harmonicSum += Math.pow(2, -this.registers[i]!);
      if (this.registers[i] === 0) zeroRegisters++;
    }

    let estimate = this.alphaMM / harmonicSum;

    // 소수 보정 (Linear Counting)
    // 추정값이 작을 때 (빈 레지스터가 많을 때) 더 정확한 보정
    if (estimate <= 2.5 * this.m && zeroRegisters > 0) {
      estimate = this.m * Math.log(this.m / zeroRegisters);
    }

    return Math.round(estimate);
  }

  // 두 HyperLogLog 병합 — 각 레지스터의 최댓값을 취함
  // 두 집합의 합집합(union) 카디널리티를 추정할 수 있다
  merge(other: HyperLogLog): HyperLogLog {
    if (this.precision !== other.precision) {
      throw new Error("정밀도가 같아야 병합 가능");
    }

    const merged = new HyperLogLog(this.precision);
    for (let i = 0; i < this.m; i++) {
      merged.registers[i] = Math.max(this.registers[i]!, other.registers[i]!);
    }
    return merged;
  }

  // 표준 오차율: 1.04 / sqrt(m)
  get errorRate(): number {
    return 1.04 / Math.sqrt(this.m);
  }

  // 사용 메모리 (bytes)
  get memoryUsage(): number {
    return this.registers.byteLength;
  }

  // --- 해시 함수 (MurmurHash3-like, 32bit) ---
  private hash(str: string): number {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    // avalanche
    h ^= h >>> 16;
    h = Math.imul(h, 0x85ebca6b);
    h ^= h >>> 13;
    h = Math.imul(h, 0xc2b2ae35);
    h ^= h >>> 16;
    return h >>> 0;
  }
}

export { HyperLogLog };
