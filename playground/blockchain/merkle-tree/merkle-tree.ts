// ============================================
// Merkle Tree (머클 트리)
// ============================================
// 거래(트랜잭션) 목록을 해시 쌍으로 묶어 올라가며 하나의 루트 해시를 만드는 이진 트리.
// 블록체인에서 "이 거래가 블록에 포함되어 있는가?"를 효율적으로 증명하는 핵심 구조.
//
// 왜 중요한가:
// - 1000개 거래가 담긴 블록에서 1개 거래를 검증하려면?
//   → 전체 1000개를 다 확인? No. 머클 증명으로 ~10개 해시만 있으면 된다 (O(log n)).
// - 비트코인 라이트 클라이언트(SPV)는 블록 전체를 다운로드하지 않고
//   머클 증명만으로 거래를 검증한다.
//
// 구조:
//        루트 해시 (Root)
//       /              \
//    H(AB)            H(CD)
//   /     \          /     \
//  H(A)   H(B)    H(C)   H(D)    ← 리프: 각 거래의 해시
//   |      |       |      |
//  Tx0    Tx1     Tx2    Tx3

// ============================================
// 간단한 해시 함수
// ============================================
// 학습용으로 외부 의존성 없이 동작하는 해시 함수.
// FNV-1a 변형: 빠르고 충돌이 적으며, 눈사태 효과를 가진다.
// (실제 블록체인은 SHA-256을 사용)
function simpleHash(data: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;

  for (let i = 0; i < data.length; i++) {
    const ch = data.charCodeAt(i);
    // 두 해시를 독립적으로 계산하여 64비트 수준의 충돌 저항성 확보
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  // 최종 믹싱: 비트를 골고루 섞어 눈사태 효과 강화
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 = Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  h1 ^= h1 >>> 16;

  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 = Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 ^= h2 >>> 16;

  // 두 32비트 해시를 합쳐 16자리 hex 문자열로 반환
  return (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
}

// ============================================
// 머클 증명 노드
// ============================================
// 증명 경로의 각 단계: 형제 노드의 해시와 방향(왼쪽/오른쪽)
interface MerkleProofNode {
  hash: string;
  direction: "left" | "right"; // 형제 노드가 왼쪽인지 오른쪽인지
}

// ============================================
// MerkleTree 클래스
// ============================================
class MerkleTree {
  // 트리의 각 레벨을 저장
  // levels[0] = 리프 레벨, levels[마지막] = 루트 레벨
  private levels: string[][];

  constructor(transactions: string[]) {
    if (transactions.length === 0) {
      throw new Error("거래가 최소 1개 이상 필요합니다");
    }

    // 1단계: 각 거래를 해시하여 리프 노드 생성
    // Tx0 → H(Tx0), Tx1 → H(Tx1), ...
    const leaves = transactions.map((tx) => simpleHash(tx));

    // 2단계: 리프부터 루트까지 트리를 빌드
    this.levels = this.buildTree(leaves);
  }

  // 트리 빌드: 리프 해시 배열 → 쌍으로 묶어 올라가기
  // [H(A), H(B), H(C), H(D)]
  //  → [H(AB), H(CD)]           ← 쌍으로 묶어 해시
  //  → [H(ABCD)]                ← 루트
  private buildTree(leaves: string[]): string[][] {
    const levels: string[][] = [leaves];
    let currentLevel = leaves;

    while (currentLevel.length > 1) {
      const nextLevel: string[] = [];

      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i]!;
        // 홀수 개일 때: 마지막 노드를 복제하여 짝을 맞춤
        // 비트코인도 동일한 방식 사용
        const right = currentLevel[i + 1] ?? left;
        nextLevel.push(simpleHash(left + right));
      }

      levels.push(nextLevel);
      currentLevel = nextLevel;
    }

    return levels;
  }

  // 루트 해시 반환 (= 모든 거래의 요약)
  // 이 한 줄의 해시가 블록 안의 수천 개 거래를 대표한다
  getRoot(): string {
    return this.levels[this.levels.length - 1]![0]!;
  }

  // 머클 증명 생성: "index번째 거래가 블록에 포함되어 있음"을 증명하는 경로
  //
  // 예: index=2 (Tx2)의 증명 경로
  //
  //        루트 (검증 도착점)
  //       /        \
  //   ★H(AB)      H(CD)        ← H(AB)가 증명에 포함 (왼쪽 형제)
  //              /     \
  //           H(C)   ★H(D)     ← H(D)가 증명에 포함 (오른쪽 형제)
  //            |
  //          [Tx2]              ← 검증하려는 거래
  //
  // 증명 = [{hash: H(D), direction: "right"}, {hash: H(AB), direction: "left"}]
  getProof(index: number): MerkleProofNode[] {
    if (index < 0 || index >= this.levels[0]!.length) {
      throw new Error(`유효하지 않은 인덱스: ${index} (범위: 0~${this.levels[0]!.length - 1})`);
    }

    const proof: MerkleProofNode[] = [];
    let currentIndex = index;

    // 리프부터 루트 바로 아래 레벨까지 올라가며 형제 해시를 수집
    for (let level = 0; level < this.levels.length - 1; level++) {
      const currentLevel = this.levels[level]!;

      // 짝수 인덱스면 형제는 오른쪽, 홀수 인덱스면 형제는 왼쪽
      const isLeftNode = currentIndex % 2 === 0;
      const siblingIndex = isLeftNode ? currentIndex + 1 : currentIndex - 1;

      // 형제가 존재하면 증명에 추가 (홀수 개일 때 마지막 노드는 형제 없음)
      if (siblingIndex < currentLevel.length) {
        proof.push({
          hash: currentLevel[siblingIndex]!,
          direction: isLeftNode ? "right" : "left",
        });
      }

      // 한 레벨 위로 올라감 (부모의 인덱스 = 현재 인덱스 / 2)
      currentIndex = Math.floor(currentIndex / 2);
    }

    return proof;
  }

  // 머클 증명 검증 (정적 메서드 - 트리 전체 없이 검증 가능!)
  //
  // 검증 과정:
  // 1. 거래를 해시한다
  // 2. 증명 경로를 따라 올라가며 해시를 계산한다
  // 3. 최종 해시가 루트와 같으면 → 거래가 블록에 포함되어 있음!
  //
  // 이것이 SPV(Simplified Payment Verification)의 핵심:
  // 라이트 클라이언트는 블록 헤더(루트 해시 포함)만 갖고 있으면
  // 전체 블록을 다운로드하지 않아도 거래를 검증할 수 있다.
  static verify(transaction: string, proof: MerkleProofNode[], root: string): boolean {
    let currentHash = simpleHash(transaction);

    for (const node of proof) {
      // 형제가 왼쪽이면: H(형제 + 나), 오른쪽이면: H(나 + 형제)
      if (node.direction === "left") {
        currentHash = simpleHash(node.hash + currentHash);
      } else {
        currentHash = simpleHash(currentHash + node.hash);
      }
    }

    return currentHash === root;
  }
}

export { MerkleTree, simpleHash };
export type { MerkleProofNode };
