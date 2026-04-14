// ============================================
// Interval Tree (구간 트리)
// ============================================
// 구간(interval)들의 집합에서 "특정 점이나 구간과 겹치는 모든 구간"을
// 효율적으로 찾는 자료구조.
//
// 핵심 아이디어:
// - BST를 기반으로 하되, 각 노드에 "서브트리 내 최대 끝점(max)"을 추가 저장.
// - 이 max 값으로 "이 서브트리에 겹치는 구간이 있을 수 있는가?"를 O(1)에 판단.
// - 없으면 서브트리 전체를 가지치기(pruning) → 평균 O(log n + k)
//
// 예) 구간들: [15,20], [10,30], [17,19], [5,20], [12,15], [30,40]
//
//         [15,20] max=40
//        /              \
//   [10,30] max=30    [17,19] max=40
//   /      \                 \
// [5,20]  [12,15]          [30,40]
// max=20  max=15           max=40

interface Interval {
  low: number;
  high: number;
}

interface IntervalNode {
  interval: Interval;
  max: number;     // 이 서브트리 내 모든 구간의 high 값 중 최댓값
  left: IntervalNode | null;
  right: IntervalNode | null;
}

class IntervalTree {
  root: IntervalNode | null = null;

  // --- 삽입 ---
  insert(interval: Interval): void {
    this.root = this.insertNode(this.root, interval);
  }

  private insertNode(node: IntervalNode | null, interval: Interval): IntervalNode {
    if (!node) {
      return { interval, max: interval.high, left: null, right: null };
    }

    // BST 기준: low 값으로 정렬
    if (interval.low < node.interval.low) {
      node.left = this.insertNode(node.left, interval);
    } else {
      node.right = this.insertNode(node.right, interval);
    }

    // max 갱신: 서브트리 내 최대 high 값
    node.max = Math.max(node.max, interval.high);
    return node;
  }

  // --- 겹침 검사 ---
  // 두 구간 [a.low, a.high]와 [b.low, b.high]가 겹치는 조건:
  // a.low <= b.high AND b.low <= a.high
  private overlaps(a: Interval, b: Interval): boolean {
    return a.low <= b.high && b.low <= a.high;
  }

  // --- 겹치는 구간 하나 찾기 --- O(log n)
  searchOne(query: Interval): Interval | null {
    let node = this.root;

    while (node) {
      if (this.overlaps(node.interval, query)) {
        return node.interval;
      }

      // 왼쪽 서브트리의 max가 query.low 이상이면 왼쪽에 겹치는 게 있을 수 있다
      if (node.left && node.left.max >= query.low) {
        node = node.left;
      } else {
        // 왼쪽에는 없으니 오른쪽으로
        node = node.right;
      }
    }

    return null;
  }

  // --- 겹치는 모든 구간 찾기 --- O(log n + k), k = 결과 수
  searchAll(query: Interval): Interval[] {
    const results: Interval[] = [];
    this.searchAllHelper(this.root, query, results);
    return results;
  }

  private searchAllHelper(
    node: IntervalNode | null,
    query: Interval,
    results: Interval[]
  ): void {
    if (!node) return;

    // 현재 노드와 겹치면 결과에 추가
    if (this.overlaps(node.interval, query)) {
      results.push(node.interval);
    }

    // 왼쪽 서브트리에 겹칠 가능성이 있으면 탐색
    if (node.left && node.left.max >= query.low) {
      this.searchAllHelper(node.left, query, results);
    }

    // 오른쪽 서브트리에 겹칠 가능성이 있으면 탐색
    // (query.high >= 오른쪽 서브트리의 최소 low 값)
    if (node.right && node.right.interval.low <= query.high) {
      this.searchAllHelper(node.right, query, results);
    }
  }

  // --- 특정 시점(point)에 포함되는 모든 구간 찾기 ---
  // "14시에 진행 중인 회의는?"
  searchPoint(point: number): Interval[] {
    return this.searchAll({ low: point, high: point });
  }
}

export { IntervalTree };
export type { Interval, IntervalNode };
