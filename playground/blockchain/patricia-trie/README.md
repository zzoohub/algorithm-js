# Patricia Trie (패트리샤 트라이)

## 개념

**Patricia Trie**(Practical Algorithm To Retrieve Information Coded In Alphanumeric)는
일반 Trie에서 자식이 하나뿐인 노드 체인을 하나의 노드로 **압축**한 자료구조다.
Radix Trie, Compressed Trie라고도 부른다.

핵심 아이디어: 불필요한 중간 노드를 제거하고, 공통 경로를 하나의 노드에 저장한다.

## 일반 Trie vs Patricia Trie

### 일반 Trie ("romane", "romanus", "romulus")

```
              (root)
                |
               [r]
                |
               [o]
                |
               [m]
              /   \
            [a]   [u]
             |     |
            [n]   [l]
            / \    |
          [e]  [u] [u]
                |   |
               [s]  [s]
```

노드 수: **12개** (값 노드 포함)

### Patricia Trie (동일한 키)

```
              (root)
                |
             ["rom"]         ← r-o-m 을 하나로 압축
              /    \
          ["an"]  ["ulus"]   ← 공통 경로 압축
          /    \
       ["e"]  ["us"]
```

노드 수: **6개** -- 절반으로 줄어든다.

키가 길고 공통 접두사가 많을수록 압축 효과가 극대화된다.
이더리움 주소(40 hex 문자)처럼 긴 키에서 특히 유리하다.

## 이더리움과 Merkle Patricia Trie

이더리움은 **Merkle Patricia Trie** = Patricia Trie + Merkle Hashing을 사용한다.

```
Patricia Trie의 경로 압축  →  노드 수 감소  →  저장 공간 절약
Merkle 해싱               →  루트 해시 하나로 전체 상태 검증 가능

둘을 합치면:
효율적인 저장 + 암호학적 검증 = 블록체인 상태 저장소
```

### 왜 Trie인가? (해시맵이 아니라)

| | 해시맵 | Trie / Patricia Trie |
|---|---|---|
| 조회 | O(1) | O(k), k=키 길이 |
| **포함 증명** | 불가능 | O(log n) 크기의 증명 가능 |
| **비포함 증명** | 불가능 | 가능 |
| 결정적 구조 | 순서 없음 | 같은 데이터 → 같은 구조 |
| 루트 해시 | 매번 전체 재계산 | 변경된 경로만 재계산 |

**핵심 차이: 증명(proof)이 가능한가.**

해시맵은 "이 키가 존재한다"를 증명하려면 전체 데이터를 줘야 한다.
Trie는 루트에서 해당 키까지의 **경로만** 주면 된다 (Merkle Proof).

라이트 클라이언트는 블록 헤더(루트 해시 포함)만 갖고 있으면,
풀 노드에게 증명 경로만 요청하여 특정 계정의 잔액을 검증할 수 있다.

## 이더리움의 4가지 노드 유형

실제 이더리움의 Modified Merkle Patricia Trie에는 4가지 노드가 있다:

### 1. Null 노드
```
빈 자리. 값이 없는 경로.
RLP 인코딩: 빈 문자열 ""
```

### 2. Branch 노드 (분기 노드)
```
[v0, v1, v2, ..., v15, value]
 ↑                  ↑    ↑
 0~f 각 nibble에    마지막  이 위치에 값이
 대한 자식 포인터    16번째  있으면 저장

16방향 분기 (hex 키의 각 nibble = 0~f)
+ 선택적 값 저장
```

### 3. Leaf 노드 (리프 노드)
```
[encodedPath, value]

남은 키 경로와 값을 저장.
더 이상 분기할 필요 없는 끝점.
```

### 4. Extension 노드 (확장 노드)
```
[encodedPath, next]

여러 키가 공유하는 공통 경로를 압축.
Patricia Trie의 "경로 압축"에 해당.
next는 Branch 노드를 가리킨다.
```

```
실제 이더리움 트라이 예시:

      [Extension: "a7"]          ← 공통 접두사 압축
             |
      [Branch: 16방향]           ← 분기점
       /    |     \
   [1]    [3]    [f]
    |      |      |
 [Leaf]  [Leaf]  [Extension: "55"]
                       |
                    [Leaf]
```

## 이더리움의 상태 저장

### State Trie (상태 트라이)

```
키: keccak256(이더리움 주소)     (32바이트)
값: RLP([nonce, balance, storageRoot, codeHash])

                    State Root (블록 헤더에 포함)
                         |
                   [Patricia Trie]
                    /     |     \
          0xa7...1f  0xd3...92  0xf8...ab
              |          |          |
    {nonce: 5,    {nonce: 0,    {nonce: 142,
     balance:      balance:      balance:
     2.5 ETH,     0.01 ETH,    1000 ETH,
     storage:..., storage:..., storage:...,
     code:...}    code:...}    code:...}
```

### Storage Trie (스토리지 트라이)

```
각 스마트 컨트랙트마다 별도의 Storage Trie가 있다.
키: keccak256(스토리지 슬롯 번호)
값: RLP(저장된 값)

State Trie의 storageRoot → 해당 컨트랙트의 Storage Trie 루트
```

### 블록 헤더와의 관계

```
블록 헤더:
{
  parentHash,
  stateRoot,          ← State Trie의 루트 해시
  transactionsRoot,   ← Transaction Trie의 루트 해시
  receiptsRoot,       ← Receipt Trie의 루트 해시
  ...
}

→ 루트 해시 3개로 블록의 전체 상태를 요약
→ 어떤 값이든 하나 변하면 루트 해시가 변함
→ 변조 불가능한 상태 저장소
```

## 실용적 활용

### 1. 계정 잔액 검증

```
라이트 클라이언트가 "0xABC...의 잔액이 10 ETH인가?" 를 검증:

1. 블록 헤더에서 stateRoot를 가져옴
2. 풀 노드에게 해당 주소의 Merkle Proof를 요청
3. 증명 경로를 따라 해시를 계산
4. 계산된 루트가 stateRoot와 일치하면 → 잔액이 맞다!

블록 전체(수 GB)를 다운로드하지 않고,
증명 경로(수 KB)만으로 검증 완료.
```

### 2. 상태 증명 (State Proof)

```
크로스체인 브릿지, L2 롤업 등에서 사용:

"체인 A에서 이 값이 정말 존재하는가?"
→ State Trie의 Merkle Proof로 증명

DeFi 프로토콜이 다른 체인의 상태를 참조할 때,
전체 상태를 복사하지 않고 증명만으로 검증한다.
```

### 3. 비포함 증명 (Proof of Exclusion)

```
"이 주소는 블랙리스트에 없다"를 증명:

Trie에서 해당 키의 경로를 따라갈 때,
중간에 경로가 끊기면 → 해당 키는 존재하지 않음.
그 "끊긴 지점"까지의 경로가 비포함 증명이 된다.

해시맵으로는 이것이 불가능하다.
```

## 복잡도

| 연산 | 시간 복잡도 | 비고 |
|---|---|---|
| insert | O(k) | k = 키 길이 |
| get | O(k) | 최악의 경우에도 키 길이에 비례 |
| delete | O(k) | 삭제 후 경로 재압축 포함 |
| getRootHash | O(n) | n = 전체 노드 수, 전체 트라이를 순회 |

일반 Trie 대비 노드 수가 크게 줄어드므로,
실제 연산에서 상수 배 빠르고 메모리도 절약된다.
