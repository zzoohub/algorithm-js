# LRU Cache (Least Recently Used 캐시)

## 개념

**가장 오래 사용하지 않은 항목을 먼저 제거**하는 캐시.
용량이 가득 차면 가장 최근에 접근하지 않은 데이터를 버린다.

```
용량 3인 LRU Cache:
put(A) → [A]
put(B) → [B, A]
put(C) → [C, B, A]
get(A) → [A, C, B]     ← A를 사용했으니 맨 앞으로
put(D) → [D, A, C]     ← 용량 초과, B 제거 (가장 오래됨)
```

## 시간 복잡도

| 연산 | 복잡도 |
|------|--------|
| get | O(1) |
| put | O(1) |

HashMap + Doubly Linked List 조합으로 모든 연산이 O(1).

## 동작 원리

**두 자료구조를 결합**한다:
1. **HashMap**: key → 노드를 O(1)로 찾기
2. **Doubly Linked List**: 사용 순서를 관리. 앞쪽이 최근, 뒤쪽이 오래됨

```
HashMap: { A: node_A, B: node_B, C: node_C }

Doubly Linked List:
head ↔ [C] ↔ [A] ↔ [B] ↔ tail
        ↑ 최근          ↑ 오래됨 (제거 대상)
```

### get(key)
1. HashMap에서 노드를 찾는다
2. 리스트에서 해당 노드를 빼서 맨 앞에 다시 넣는다 (최근 사용 표시)

### put(key, value)
1. 이미 있으면: 값 업데이트 후 맨 앞으로 이동
2. 새 항목이면: 맨 앞에 삽입
3. 용량 초과면: tail 쪽(가장 오래된) 노드를 삭제

### 더미 노드 (sentinel)
head와 tail을 더미 노드로 두면 삽입/삭제 시 null 체크 조건이 사라진다.
이런 패턴을 "sentinel node"라고 한다.

## 실무에서의 활용

### 1. 브라우저 캐시
자주 방문하는 페이지의 리소스(이미지, CSS, JS)를 캐시하고,
디스크 용량이 부족하면 오래된 캐시부터 제거한다.

### 2. 데이터베이스 버퍼 풀
MySQL InnoDB의 Buffer Pool이 LRU 변형을 사용한다.
자주 읽는 페이지를 메모리에 유지해서 디스크 I/O를 줄인다.

### 3. CDN 캐싱
Cloudflare, CloudFront 등이 인기 있는 콘텐츠를 엣지에 캐시.

### 4. CPU 캐시
L1/L2/L3 캐시가 LRU 변형 정책으로 어떤 캐시 라인을 유지할지 결정.

### 5. React Query / SWR
API 응답을 캐시하고, 오래된 캐시는 stale 처리 후 revalidate.

### 6. OS 페이지 교체
메모리가 부족할 때 어떤 페이지를 디스크로 내보낼지 LRU로 결정.
