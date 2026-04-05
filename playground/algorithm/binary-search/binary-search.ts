// ============================================
// 기본 이진 탐색 — 정확한 값 찾기
// ============================================
function binarySearch(arr: number[], target: number): number {
  let lo = 0, hi = arr.length - 1;

  while (lo <= hi) {
    const mid = lo + ((hi - lo) >> 1); // 오버플로우 방지
    if (arr[mid] === target) return mid;
    if (arr[mid]! < target) lo = mid + 1;
    else hi = mid - 1;
  }

  return -1; // 못 찾음
}

// ============================================
// Lower Bound — target 이상인 첫 위치
// ============================================
// C++의 std::lower_bound와 동일
// [1, 2, 4, 4, 4, 7] target=4 → 인덱스 2 (첫 번째 4)
function lowerBound(arr: number[], target: number): number {
  let lo = 0, hi = arr.length;

  while (lo < hi) {
    const mid = lo + ((hi - lo) >> 1);
    if (arr[mid]! < target) lo = mid + 1;
    else hi = mid;
  }

  return lo;
}

// ============================================
// Upper Bound — target 초과인 첫 위치
// ============================================
// [1, 2, 4, 4, 4, 7] target=4 → 인덱스 5 (7의 위치)
function upperBound(arr: number[], target: number): number {
  let lo = 0, hi = arr.length;

  while (lo < hi) {
    const mid = lo + ((hi - lo) >> 1);
    if (arr[mid]! <= target) lo = mid + 1;
    else hi = mid;
  }

  return lo;
}

// ============================================
// 조건 기반 이진 탐색 (Parametric Search)
// ============================================
// "조건을 만족하는 최소값/최대값을 찾아라"
// condition이 false → true로 바뀌는 첫 지점을 찾는다
//
// 예: "나무를 높이 H로 자를 때, 잘린 나무 합이 M 이상이 되는 최대 H는?"
function parametricSearch(
  lo: number,
  hi: number,
  condition: (mid: number) => boolean
): number {
  while (lo < hi) {
    const mid = lo + ((hi - lo) >> 1);
    if (condition(mid)) {
      hi = mid; // 조건을 만족 → 더 작은 값도 가능할까?
    } else {
      lo = mid + 1; // 조건 불만족 → 더 큰 값이 필요
    }
  }
  return lo;
}

// ============================================
// 회전 정렬 배열에서 탐색
// ============================================
// [4, 5, 6, 7, 0, 1, 2] 에서 target 찾기
function searchRotated(arr: number[], target: number): number {
  let lo = 0, hi = arr.length - 1;

  while (lo <= hi) {
    const mid = lo + ((hi - lo) >> 1);
    if (arr[mid] === target) return mid;

    // 왼쪽 절반이 정렬됨
    if (arr[lo]! <= arr[mid]!) {
      if (arr[lo]! <= target && target < arr[mid]!) {
        hi = mid - 1;
      } else {
        lo = mid + 1;
      }
    }
    // 오른쪽 절반이 정렬됨
    else {
      if (arr[mid]! < target && target <= arr[hi]!) {
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
  }

  return -1;
}

export { binarySearch, lowerBound, upperBound, parametricSearch, searchRotated };
