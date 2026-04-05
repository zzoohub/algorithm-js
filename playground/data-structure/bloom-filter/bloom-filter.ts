class BloomFilter {
  private bits: Uint8Array;
  private bitCount: number;
  private hashCount: number;

  // bitCount: 비트 배열 크기, hashCount: 해시 함수 개수
  // 오탐률(false positive rate) ≈ (1 - e^(-k*n/m))^k
  // m = bitCount, k = hashCount, n = 삽입된 요소 수
  constructor(bitCount = 1024, hashCount = 3) {
    this.bitCount = bitCount;
    this.hashCount = hashCount;
    this.bits = new Uint8Array(Math.ceil(bitCount / 8));
  }

  // 편의 생성자: 예상 요소 수와 오탐률로 최적 파라미터 계산
  static withAccuracy(expectedItems: number, falsePositiveRate: number): BloomFilter {
    // 최적 비트 수: m = -n * ln(p) / (ln(2))^2
    const m = Math.ceil(-expectedItems * Math.log(falsePositiveRate) / (Math.LN2 ** 2));
    // 최적 해시 수: k = (m/n) * ln(2)
    const k = Math.max(1, Math.round((m / expectedItems) * Math.LN2));
    return new BloomFilter(m, k);
  }

  add(value: string): void {
    for (let i = 0; i < this.hashCount; i++) {
      const pos = this.getHash(value, i);
      this.setBit(pos);
    }
  }

  // true = "아마도 있다", false = "확실히 없다"
  mightContain(value: string): boolean {
    for (let i = 0; i < this.hashCount; i++) {
      const pos = this.getHash(value, i);
      if (!this.getBit(pos)) return false; // 하나라도 0이면 확실히 없음
    }
    return true; // 모두 1이면 "아마도" 있음
  }

  // --- 내부 ---

  // i번째 해시: 두 개의 기본 해시를 조합 (Double Hashing)
  // h_i(x) = (h1(x) + i * h2(x)) % m
  private getHash(value: string, i: number): number {
    const h1 = this.fnv1a(value);
    const h2 = this.djb2(value);
    return Math.abs((h1 + i * h2) % this.bitCount);
  }

  private setBit(pos: number): void {
    this.bits[Math.floor(pos / 8)] |= (1 << (pos % 8));
  }

  private getBit(pos: number): boolean {
    return (this.bits[Math.floor(pos / 8)]! & (1 << (pos % 8))) !== 0;
  }

  // FNV-1a 해시
  private fnv1a(str: string): number {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = (hash * 0x01000193) >>> 0;
    }
    return hash;
  }

  // DJB2 해시
  private djb2(str: string): number {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
    }
    return hash;
  }
}

export { BloomFilter };
