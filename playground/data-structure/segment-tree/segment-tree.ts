// ============================================
// Segment Tree (세그먼트 트리)
// ============================================
// 배열의 "구간 질의"와 "점 갱신"을 모두 O(log n)에 처리하는 트리.
// 구간 합, 구간 최솟값, 구간 최댓값 등 다양한 연산에 적용 가능.
//
// 핵심 아이디어:
// - 배열을 이진 트리로 표현. 각 노드가 특정 구간의 정보를 저장.
// - 리프 = 원본 배열의 각 원소
// - 내부 노드 = 자식 구간을 합친 결과
//
// 예) 배열 [1, 3, 5, 7, 9, 11]의 구간 합 세그먼트 트리:
//
//                 [36]              ← 전체 합 (0~5)
//              /        \
//           [9]          [27]       ← (0~2), (3~5)
//          /   \        /    \
//        [4]   [5]   [16]   [11]   ← (0~1), (2), (3~4), (5)
//       / \          / \
//     [1] [3]     [7] [9]          ← 리프 노드들

// ============================================
// 1. 기본 Segment Tree — 구간 합 질의 + 점 갱신
// ============================================
class SegmentTree {
  private tree: number[];
  private n: number;

  constructor(arr: number[]) {
    this.n = arr.length;
    // 트리 크기: 4 * n이면 충분 (완전 이진 트리 + 여유)
    this.tree = new Array(4 * this.n).fill(0);
    this.build(arr, 1, 0, this.n - 1);
  }

  // 트리 구축: O(n)
  // node: 현재 트리 노드 인덱스 (1부터 시작)
  // start~end: 이 노드가 담당하는 원본 배열의 범위
  private build(arr: number[], node: number, start: number, end: number): void {
    if (start === end) {
      // 리프 노드 — 원본 배열 값 그대로
      this.tree[node] = arr[start]!;
      return;
    }

    const mid = Math.floor((start + end) / 2);
    this.build(arr, 2 * node, start, mid);       // 왼쪽 자식
    this.build(arr, 2 * node + 1, mid + 1, end); // 오른쪽 자식
    this.tree[node] = this.tree[2 * node]! + this.tree[2 * node + 1]!; // 합치기
  }

  // 점 갱신: arr[index] = value — O(log n)
  // 해당 리프부터 루트까지 올라가며 갱신
  update(index: number, value: number): void {
    this.updateHelper(1, 0, this.n - 1, index, value);
  }

  private updateHelper(
    node: number, start: number, end: number,
    index: number, value: number
  ): void {
    if (start === end) {
      // 리프에 도달 — 값 교체
      this.tree[node] = value;
      return;
    }

    const mid = Math.floor((start + end) / 2);
    if (index <= mid) {
      this.updateHelper(2 * node, start, mid, index, value);
    } else {
      this.updateHelper(2 * node + 1, mid + 1, end, index, value);
    }
    // 자식이 바뀌었으니 현재 노드도 갱신
    this.tree[node] = this.tree[2 * node]! + this.tree[2 * node + 1]!;
  }

  // 구간 합 질의: sum(left..right) — O(log n)
  query(left: number, right: number): number {
    return this.queryHelper(1, 0, this.n - 1, left, right);
  }

  private queryHelper(
    node: number, start: number, end: number,
    left: number, right: number
  ): number {
    // 현재 구간이 질의 범위 밖 → 기여 없음
    if (right < start || end < left) return 0;

    // 현재 구간이 질의 범위에 완전히 포함 → 저장된 값 그대로 반환
    if (left <= start && end <= right) return this.tree[node]!;

    // 일부만 겹침 → 자식에게 위임
    const mid = Math.floor((start + end) / 2);
    return (
      this.queryHelper(2 * node, start, mid, left, right) +
      this.queryHelper(2 * node + 1, mid + 1, end, left, right)
    );
  }
}

// ============================================
// 2. Lazy Propagation — 구간 갱신 + 구간 질의
// ============================================
// 점 갱신은 O(log n)이지만, "구간 전체에 +5" 같은 연산은 점 갱신으로는 O(n log n).
// Lazy Propagation: 갱신을 즉시 하지 않고, 필요할 때까지 "미뤄둔다" (lazy).
//
// 핵심: 각 노드에 lazy 값을 저장해두고,
// 자식을 방문할 때 비로소 전파(propagate)한다.
// → 구간 갱신도 O(log n)
class LazySegmentTree {
  private tree: number[];
  private lazy: number[]; // 미뤄둔 갱신값
  private n: number;

  constructor(arr: number[]) {
    this.n = arr.length;
    this.tree = new Array(4 * this.n).fill(0);
    this.lazy = new Array(4 * this.n).fill(0);
    this.build(arr, 1, 0, this.n - 1);
  }

  private build(arr: number[], node: number, start: number, end: number): void {
    if (start === end) {
      this.tree[node] = arr[start]!;
      return;
    }
    const mid = Math.floor((start + end) / 2);
    this.build(arr, 2 * node, start, mid);
    this.build(arr, 2 * node + 1, mid + 1, end);
    this.tree[node] = this.tree[2 * node]! + this.tree[2 * node + 1]!;
  }

  // 밀린 갱신을 자식에게 전파
  private propagate(node: number, start: number, end: number): void {
    if (this.lazy[node] === 0) return; // 밀린 것 없음

    const mid = Math.floor((start + end) / 2);
    const leftSize = mid - start + 1;
    const rightSize = end - mid;

    // 자식 노드의 tree 값 갱신
    this.tree[2 * node]! += this.lazy[node]! * leftSize;
    this.tree[2 * node + 1]! += this.lazy[node]! * rightSize;

    // 자식 노드에 lazy 전파
    this.lazy[2 * node]! += this.lazy[node]!;
    this.lazy[2 * node + 1]! += this.lazy[node]!;

    // 현재 노드의 lazy 해소
    this.lazy[node] = 0;
  }

  // 구간 갱신: arr[left..right] 전체에 value를 더한다 — O(log n)
  rangeUpdate(left: number, right: number, value: number): void {
    this.rangeUpdateHelper(1, 0, this.n - 1, left, right, value);
  }

  private rangeUpdateHelper(
    node: number, start: number, end: number,
    left: number, right: number, value: number
  ): void {
    if (right < start || end < left) return;

    if (left <= start && end <= right) {
      // 현재 구간이 완전히 포함됨 — 여기서 멈추고 lazy에 기록
      this.tree[node]! += value * (end - start + 1);
      this.lazy[node]! += value;
      return;
    }

    // 자식에게 내려가기 전에 밀린 갱신 먼저 처리
    this.propagate(node, start, end);

    const mid = Math.floor((start + end) / 2);
    this.rangeUpdateHelper(2 * node, start, mid, left, right, value);
    this.rangeUpdateHelper(2 * node + 1, mid + 1, end, left, right, value);
    this.tree[node] = this.tree[2 * node]! + this.tree[2 * node + 1]!;
  }

  // 구간 합 질의 — O(log n)
  query(left: number, right: number): number {
    return this.queryHelper(1, 0, this.n - 1, left, right);
  }

  private queryHelper(
    node: number, start: number, end: number,
    left: number, right: number
  ): number {
    if (right < start || end < left) return 0;
    if (left <= start && end <= right) return this.tree[node]!;

    this.propagate(node, start, end);

    const mid = Math.floor((start + end) / 2);
    return (
      this.queryHelper(2 * node, start, mid, left, right) +
      this.queryHelper(2 * node + 1, mid + 1, end, left, right)
    );
  }
}

export { SegmentTree, LazySegmentTree };
