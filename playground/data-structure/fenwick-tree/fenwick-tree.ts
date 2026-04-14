// ============================================
// Fenwick Tree (Binary Indexed Tree, BIT)
// ============================================
// Segment Tree의 경량 버전.
// 구간 합(prefix sum) 질의와 점 갱신을 모두 O(log n)에 처리.
// 구현이 극도로 간결하면서 성능이 뛰어나다.
//
// 핵심 트릭: i & (-i)
// - 이진수에서 "가장 낮은 1 비트"를 추출한다.
// - 이 값이 해당 노드가 담당하는 구간의 길이가 된다.
//
// 예) i = 12 = 1100₂
//     i & (-i) = 0100₂ = 4
//     → 인덱스 12는 arr[9..12] (4개)의 합을 저장
//
// 인덱스(1-based)가 담당하는 구간:
//   1  (0001) → arr[1]      길이 1
//   2  (0010) → arr[1..2]   길이 2
//   3  (0011) → arr[3]      길이 1
//   4  (0100) → arr[1..4]   길이 4
//   5  (0101) → arr[5]      길이 1
//   6  (0110) → arr[5..6]   길이 2
//   7  (0111) → arr[7]      길이 1
//   8  (1000) → arr[1..8]   길이 8

class FenwickTree {
  private tree: number[];
  private n: number;

  constructor(size: number) {
    this.n = size;
    // 1-indexed: tree[0]은 사용하지 않음
    this.tree = new Array(size + 1).fill(0);
  }

  // 배열로부터 한 번에 구축 — O(n)
  // (update를 n번 호출하면 O(n log n)이지만, 이 방법은 O(n))
  static fromArray(arr: number[]): FenwickTree {
    const ft = new FenwickTree(arr.length);
    // 먼저 값을 복사
    for (let i = 0; i < arr.length; i++) {
      ft.tree[i + 1] = arr[i]!;
    }
    // 부모에게 전파
    for (let i = 1; i <= arr.length; i++) {
      const parent = i + (i & -i);
      if (parent <= arr.length) {
        ft.tree[parent]! += ft.tree[i]!;
      }
    }
    return ft;
  }

  // 점 갱신: arr[index]에 delta를 더한다 — O(log n)
  // index를 포함하는 모든 구간을 위로 올라가며 갱신
  // "위로 올라가기" = i += (i & -i)
  update(index: number, delta: number): void {
    let i = index + 1; // 1-indexed로 변환
    while (i <= this.n) {
      this.tree[i]! += delta;
      i += i & -i; // 다음 구간 (부모 방향)
    }
  }

  // Prefix Sum: arr[0..index]의 합 — O(log n)
  // 구간들을 아래로 내려가며 더한다
  // "아래로 내려가기" = i -= (i & -i)
  prefixSum(index: number): number {
    let sum = 0;
    let i = index + 1; // 1-indexed
    while (i > 0) {
      sum += this.tree[i]!;
      i -= i & -i; // 다음 구간 (자식 방향)
    }
    return sum;
  }

  // 구간 합: arr[left..right] — O(log n)
  // prefixSum(right) - prefixSum(left - 1)
  rangeSum(left: number, right: number): number {
    const rightSum = this.prefixSum(right);
    const leftSum = left > 0 ? this.prefixSum(left - 1) : 0;
    return rightSum - leftSum;
  }
}

// ============================================
// Range Update + Point Query 변형
// ============================================
// 기본 Fenwick은 "점 갱신 + 구간 질의"
// 이 변형은 반대: "구간 갱신 + 점 질의"
//
// 차분 배열(difference array) 아이디어:
// diff[i] = arr[i] - arr[i-1] 로 저장하면
// arr[i] = diff[0] + diff[1] + ... + diff[i] = prefixSum(i)
//
// "arr[left..right] += value"는
// diff[left] += value, diff[right+1] -= value 로 표현 가능
class RangeUpdateFenwick {
  private tree: FenwickTree;
  private n: number;

  constructor(size: number) {
    this.n = size;
    this.tree = new FenwickTree(size);
  }

  // 구간 [left..right]에 value를 더한다 — O(log n)
  rangeUpdate(left: number, right: number, value: number): void {
    this.tree.update(left, value);
    if (right + 1 < this.n) {
      this.tree.update(right + 1, -value);
    }
  }

  // 점 질의: arr[index]의 현재 값 — O(log n)
  pointQuery(index: number): number {
    return this.tree.prefixSum(index);
  }
}

export { FenwickTree, RangeUpdateFenwick };
