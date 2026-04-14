// ============================================
// Patricia Trie (패트리샤 트라이 / Radix Trie / Compressed Trie)
// ============================================
// 일반 Trie에서 자식이 하나뿐인 노드 체인을 하나의 노드로 압축한 자료구조.
// 이더리움은 이 구조에 머클 해싱을 결합한 "Merkle Patricia Trie"로
// 전체 네트워크의 상태(계정 잔액, 컨트랙트 스토리지 등)를 저장한다.
//
// 왜 경로 압축이 중요한가:
// - 이더리움 주소는 20바이트(40 hex 문자). 일반 Trie면 최소 40단계 깊이.
// - 수백만 계정이 있어도 대부분의 경로는 공유되지 않는다.
// - 압축하면 "공통 접두사"를 하나의 노드에 저장 → 트리 깊이와 노드 수가 줄어든다.
// - 노드가 줄면 → 머클 해시 계산도 줄고 → 상태 증명(proof)도 작아진다.
//
// 이더리움에서의 역할:
// - State Trie: 주소 → {nonce, balance, storageRoot, codeHash}
// - Storage Trie: 컨트랙트별 키-값 저장소
// - Transaction Trie: 블록 내 트랜잭션 목록
// - Receipt Trie: 트랜잭션 실행 결과(로그, 가스 등)
//
// 구조 비교 (일반 Trie vs Patricia Trie):
//
//   일반 Trie ("abc", "abd"):          Patricia Trie ("abc", "abd"):
//        (root)                              (root)
//          |                                   |
//         [a]                                ["ab"]  ← 공통 경로 압축
//          |                                 /    \
//         [b]                             ["c"]  ["d"]
//        /   \
//      [c]   [d]
//
// 노드 6개 → 4개로 줄어든다. 실제 블록체인에서는 이 차이가 수백만 배.

// ============================================
// 간단한 해시 함수
// ============================================
// 학습용 해시 함수 (FNV-1a 변형).
// 실제 이더리움은 Keccak-256을 사용한다.
// 머클 패트리샤 트라이에서 각 노드의 해시는
// 자식들의 해시를 포함하므로, 어떤 값이 바뀌면 루트까지 해시가 전파된다.
function simpleHash(data: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;

  for (let i = 0; i < data.length; i++) {
    const ch = data.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 = Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  h1 ^= h1 >>> 16;

  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 = Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 ^= h2 >>> 16;

  return (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
}

// ============================================
// Patricia 노드
// ============================================
// key: 압축된 경로 (여러 문자를 하나의 노드에 저장)
// value: 이 경로에 대응하는 값 (null이면 중간 노드)
// children: 다음 문자 → 자식 노드 매핑
//
// 이더리움의 4가지 노드 유형을 단순화한 것:
// - null 노드: 빈 자리       → children이 비고 value가 null
// - leaf 노드: 끝점          → children이 비고 value가 있음
// - extension 노드: 압축 경로 → key 길이 > 0, children 1개
// - branch 노드: 분기점      → children 여러 개
class PatriciaNode {
  key: string;
  value: string | null;
  children: Map<string, PatriciaNode>;

  constructor(key: string = "", value: string | null = null) {
    this.key = key;
    this.value = value;
    this.children = new Map();
  }
}

// ============================================
// PatriciaTrie 클래스
// ============================================
class PatriciaTrie {
  root: PatriciaNode;

  constructor() {
    this.root = new PatriciaNode();
  }

  // ============================================
  // insert: 키-값 삽입 (경로 압축 포함)
  // ============================================
  // 삽입 시 3가지 경우를 처리한다:
  // 1. 완전 일치: 기존 노드의 키와 남은 키가 정확히 일치 → 값만 갱신
  // 2. 새 경로: 해당 첫 문자로 시작하는 자식이 없음 → 새 노드 추가
  // 3. 부분 일치: 기존 노드의 키와 일부만 일치 → 노드를 분할(split)
  //
  // 이더리움에서: 새 계정이 생기면 State Trie에 주소를 키로 삽입.
  // 주소가 비슷하면 공통 접두사 부분은 공유하고 다른 부분에서 분기.
  insert(key: string, value: string): void {
    this._insert(this.root, key, value);
  }

  private _insert(node: PatriciaNode, remainingKey: string, value: string): void {
    // 남은 키가 없으면 → 현재 노드에 값 저장
    if (remainingKey.length === 0) {
      node.value = value;
      return;
    }

    const firstChar = remainingKey[0]!;
    const child = node.children.get(firstChar);

    // 경우 2: 해당 문자로 시작하는 자식이 없음 → 새 리프 노드 생성
    if (!child) {
      node.children.set(firstChar, new PatriciaNode(remainingKey, value));
      return;
    }

    // 기존 자식의 키와 남은 키의 공통 접두사 길이를 구한다
    const commonLength = this.commonPrefixLength(child.key, remainingKey);

    // 경우 1: 자식의 키와 완전히 일치 → 그 자식 아래로 재귀
    if (commonLength === child.key.length) {
      this._insert(child, remainingKey.slice(commonLength), value);
      return;
    }

    // 경우 3: 부분 일치 → 노드 분할 (split)
    // 예: 기존 ["abc"]=v1 에 "abd"=v2 삽입
    //   → ["ab"] (분할 노드, 공통 접두사)
    //       ├── ["c"]=v1 (기존 값)
    //       └── ["d"]=v2 (새 값)
    //
    // 이 분할이 Patricia Trie의 핵심!
    // 공통 부분은 한 번만 저장하고, 다른 부분에서만 분기한다.
    const commonPrefix = child.key.slice(0, commonLength);
    const childSuffix = child.key.slice(commonLength);
    const remainingSuffix = remainingKey.slice(commonLength);

    // 새 중간 노드 (공통 접두사를 가짐)
    const splitNode = new PatriciaNode(commonPrefix);

    // 기존 자식을 분할 노드의 자식으로 이동
    const oldChild = new PatriciaNode(childSuffix, child.value);
    oldChild.children = child.children;
    splitNode.children.set(childSuffix[0]!, oldChild);

    // 새 키의 나머지 부분을 분할 노드에 추가
    if (remainingSuffix.length === 0) {
      // 공통 접두사 자체가 새 키 → 분할 노드에 값 저장
      splitNode.value = value;
    } else {
      splitNode.children.set(remainingSuffix[0]!, new PatriciaNode(remainingSuffix, value));
    }

    // 부모의 자식을 분할 노드로 교체
    node.children.set(firstChar, splitNode);
  }

  // ============================================
  // get: 키로 값 조회
  // ============================================
  // 압축된 경로를 따라 내려가며 키를 소비한다.
  // 이더리움에서: 주소로 계정 잔액을 조회하는 과정과 동일.
  get(key: string): string | null {
    return this._get(this.root, key);
  }

  private _get(node: PatriciaNode, remainingKey: string): string | null {
    if (remainingKey.length === 0) {
      return node.value;
    }

    const firstChar = remainingKey[0]!;
    const child = node.children.get(firstChar);
    if (!child) return null;

    // 자식의 키가 남은 키의 접두사가 아니면 → 존재하지 않음
    if (!remainingKey.startsWith(child.key)) return null;

    return this._get(child, remainingKey.slice(child.key.length));
  }

  // ============================================
  // delete: 키 삭제
  // ============================================
  // 삭제 후 불필요한 노드를 정리(merge)한다.
  // 자식이 하나뿐인 중간 노드는 자식과 합쳐서 경로를 다시 압축.
  //
  // 이더리움에서: 계정 잔액이 0이 되고 nonce도 0이면 상태에서 제거.
  // 삭제 후에도 트라이 구조가 최적 압축 상태를 유지해야 한다.
  delete(key: string): boolean {
    return this._delete(this.root, key);
  }

  private _delete(node: PatriciaNode, remainingKey: string): boolean {
    if (remainingKey.length === 0) {
      if (node.value === null) return false;
      node.value = null;
      return true;
    }

    const firstChar = remainingKey[0]!;
    const child = node.children.get(firstChar);
    if (!child) return false;
    if (!remainingKey.startsWith(child.key)) return false;

    const deleted = this._delete(child, remainingKey.slice(child.key.length));
    if (!deleted) return false;

    // 삭제 후 정리: 값도 없고 자식도 없는 노드는 제거
    if (child.value === null && child.children.size === 0) {
      node.children.delete(firstChar);
    }
    // 값이 없고 자식이 하나뿐인 노드 → 자식과 합병 (경로 재압축)
    // 예: ["ab"] → ["c"]=v  를  ["abc"]=v 로 합침
    else if (child.value === null && child.children.size === 1) {
      const [, grandchild] = child.children.entries().next().value as [string, PatriciaNode];
      child.key = child.key + grandchild.key;
      child.value = grandchild.value;
      child.children = grandchild.children;
    }

    return true;
  }

  // ============================================
  // getRootHash: 트라이 전체의 해시 (머클 패트리샤 개념)
  // ============================================
  // 모든 노드의 해시를 자식부터 루트까지 계산하여 올라간다.
  // 어떤 값이든 하나라도 바뀌면 루트 해시가 달라진다.
  //
  // 이더리움에서:
  // - 블록 헤더에 stateRoot, transactionsRoot, receiptsRoot가 포함됨
  // - 이 루트 해시 하나로 전체 상태의 무결성을 보장
  // - 라이트 클라이언트는 루트 해시만으로 특정 계정의 잔액을 검증 가능
  getRootHash(): string {
    return this._computeHash(this.root);
  }

  private _computeHash(node: PatriciaNode): string {
    // 리프 노드: 키 + 값을 해시
    if (node.children.size === 0) {
      return simpleHash(node.key + ":" + (node.value ?? ""));
    }

    // 내부 노드: 키 + 값 + 모든 자식 해시를 합쳐서 해시
    // 자식 해시가 포함되므로, 하위 어디가 바뀌어도 이 해시가 변한다 (머클 성질)
    const childHashes: string[] = [];
    // 키를 정렬하여 결정적(deterministic) 해시를 보장
    const sortedKeys = [...node.children.keys()].sort();
    for (const key of sortedKeys) {
      const child = node.children.get(key)!;
      childHashes.push(key + ":" + this._computeHash(child));
    }

    return simpleHash(node.key + ":" + (node.value ?? "") + "|" + childHashes.join(","));
  }

  // ============================================
  // getAllEntries: 트라이에 저장된 모든 키-값 쌍 반환
  // ============================================
  // DFS로 모든 경로를 탐색하며 값이 있는 노드의 키를 조합한다.
  getAllEntries(): Array<{ key: string; value: string }> {
    const entries: Array<{ key: string; value: string }> = [];
    this._collectEntries(this.root, "", entries);
    return entries;
  }

  private _collectEntries(
    node: PatriciaNode,
    prefix: string,
    entries: Array<{ key: string; value: string }>,
  ): void {
    const currentPath = prefix + node.key;

    if (node.value !== null) {
      entries.push({ key: currentPath, value: node.value });
    }

    for (const [, child] of node.children) {
      this._collectEntries(child, currentPath, entries);
    }
  }

  // ============================================
  // 유틸리티: 두 문자열의 공통 접두사 길이
  // ============================================
  private commonPrefixLength(a: string, b: string): number {
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) {
      i++;
    }
    return i;
  }
}

export { PatriciaTrie, PatriciaNode, simpleHash };
