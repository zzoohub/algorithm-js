// ============================================
// Consistent Hashing (일관된 해싱)
// ============================================
// 분산 시스템에서 "어떤 키를 어떤 서버에 저장할 것인가?"를 결정하는 알고리즘.
//
// 일반 해싱의 문제:
//   server = hash(key) % N  (N = 서버 수)
//   → 서버를 추가/제거하면 N이 바뀌고, 거의 모든 키가 재배치됨!
//   → 3대 → 4대로 늘리면 약 75%의 키가 다른 서버로 이동
//
// Consistent Hashing의 해법:
//   해시 공간을 원(ring)으로 만들고, 서버와 키를 모두 원 위에 배치.
//   각 키는 시계방향으로 가장 가까운 서버에 할당.
//   → 서버 추가/제거 시 영향받는 키가 평균 K/N개뿐! (K=전체 키 수, N=서버 수)
//
// 가상 노드(Virtual Nodes):
//   물리 서버 하나당 여러 개의 가상 노드를 원 위에 배치.
//   → 키 분포가 더 균등해짐 (편향 방지)
//
//         0
//     vA2 . vB1         (v = virtual node)
//    /     |     \
//  270     |      90    ← 원형 해시 공간
//    \     |     /
//     vB2 . vA1
//        180
//
//  key1(hash=50)   → 시계방향 → vB1(hash=80)  → 서버 B
//  key2(hash=200)  → 시계방향 → vA2(hash=300) → 서버 A

class ConsistentHash {
  // 정렬된 해시값 배열 (원 위의 위치들)
  private ring: number[] = [];
  // 해시값 → 노드 이름 매핑
  private hashToNode: Map<number, string> = new Map();
  // 노드 이름 → 가상 노드 해시값들
  private nodeToHashes: Map<string, number[]> = new Map();
  private virtualNodes: number;

  // virtualNodes: 물리 노드 하나당 가상 노드 수 (150~200이 실무적으로 적절)
  constructor(virtualNodes = 150) {
    this.virtualNodes = virtualNodes;
  }

  // 노드(서버) 추가
  addNode(node: string): void {
    const hashes: number[] = [];

    for (let i = 0; i < this.virtualNodes; i++) {
      const hash = this.hash(`${node}:${i}`);
      hashes.push(hash);
      this.hashToNode.set(hash, node);
      this.ring.push(hash);
    }

    this.nodeToHashes.set(node, hashes);
    this.ring.sort((a, b) => a - b); // 원 위에서 정렬 유지
  }

  // 노드 제거 — 해당 노드의 가상 노드만 제거됨
  // → 이 노드가 담당하던 키들만 다음 노드로 재배치 (나머지는 영향 없음!)
  removeNode(node: string): void {
    const hashes = this.nodeToHashes.get(node);
    if (!hashes) return;

    for (const hash of hashes) {
      this.hashToNode.delete(hash);
      const idx = this.ring.indexOf(hash);
      if (idx !== -1) this.ring.splice(idx, 1);
    }

    this.nodeToHashes.delete(node);
  }

  // 키가 어떤 노드에 할당되는지 결정
  // 키의 해시값에서 시계방향으로 가장 가까운 노드를 찾는다
  getNode(key: string): string | null {
    if (this.ring.length === 0) return null;

    const hash = this.hash(key);

    // 이진 탐색: hash 이상인 첫 번째 위치를 찾는다
    let lo = 0, hi = this.ring.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.ring[mid]! < hash) lo = mid + 1;
      else hi = mid;
    }

    // 원형이므로 끝을 넘어가면 처음으로
    const idx = lo % this.ring.length;
    return this.hashToNode.get(this.ring[idx]!)!;
  }

  // 복제를 위해 N개의 서로 다른 노드를 반환
  // 데이터를 여러 서버에 복제할 때 사용 (예: Cassandra의 replication factor)
  getNodes(key: string, count: number): string[] {
    if (this.ring.length === 0) return [];

    const hash = this.hash(key);
    const nodes: string[] = [];
    const seen = new Set<string>();

    let lo = 0, hi = this.ring.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.ring[mid]! < hash) lo = mid + 1;
      else hi = mid;
    }

    // 시계방향으로 돌면서 서로 다른 물리 노드를 N개 수집
    for (let i = 0; i < this.ring.length && nodes.length < count; i++) {
      const idx = (lo + i) % this.ring.length;
      const node = this.hashToNode.get(this.ring[idx]!)!;
      if (!seen.has(node)) {
        seen.add(node);
        nodes.push(node);
      }
    }

    return nodes;
  }

  // 현재 등록된 물리 노드 수
  get nodeCount(): number {
    return this.nodeToHashes.size;
  }

  // --- 해시 함수 ---
  private hash(str: string): number {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    h ^= h >>> 16;
    h = Math.imul(h, 0x85ebca6b);
    h ^= h >>> 13;
    return h >>> 0;
  }
}

export { ConsistentHash };
