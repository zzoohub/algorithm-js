// ============================================
// Merge Sort (병합 정렬) — 분할 정복
// ============================================
function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  return merge(left, right);
}

function merge(left: number[], right: number[]): number[] {
  const result: number[] = [];
  let i = 0, j = 0;

  while (i < left.length && j < right.length) {
    if (left[i]! <= right[j]!) {
      result.push(left[i]!);
      i++;
    } else {
      result.push(right[j]!);
      j++;
    }
  }

  // 남은 요소 추가
  while (i < left.length) result.push(left[i++]!);
  while (j < right.length) result.push(right[j++]!);

  return result;
}

// ============================================
// Quick Sort (퀵 정렬) — 분할 정복
// ============================================
function quickSort(arr: number[], low = 0, high = arr.length - 1): number[] {
  if (low < high) {
    const pivotIndex = partition(arr, low, high);
    quickSort(arr, low, pivotIndex - 1);
    quickSort(arr, pivotIndex + 1, high);
  }
  return arr;
}

function partition(arr: number[], low: number, high: number): number {
  // Median of Three: low, mid, high 중 중간값을 피벗으로 선택
  // 이미 정렬된 배열에서 최악의 경우(O(n²))를 방지한다
  const mid = Math.floor((low + high) / 2);
  if (arr[low]! > arr[mid]!) [arr[low], arr[mid]] = [arr[mid]!, arr[low]!];
  if (arr[low]! > arr[high]!) [arr[low], arr[high]] = [arr[high]!, arr[low]!];
  if (arr[mid]! > arr[high]!) [arr[mid], arr[high]] = [arr[high]!, arr[mid]!];
  // 위 세 번의 swap으로 arr[low] <= arr[mid] <= arr[high]가 됨
  // 중간값(arr[mid])을 피벗으로 사용하기 위해 끝으로 이동
  [arr[mid], arr[high]] = [arr[high]!, arr[mid]!];

  const pivot = arr[high]!;
  let i = low - 1;

  for (let j = low; j < high; j++) {
    if (arr[j]! <= pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j]!, arr[i]!];
    }
  }
  [arr[i + 1], arr[high]] = [arr[high]!, arr[i + 1]!];
  return i + 1;
}

// ============================================
// Counting Sort (계수 정렬) — 비교하지 않는 정렬
// ============================================
function countingSort(arr: number[]): number[] {
  if (arr.length === 0) return [];

  const max = Math.max(...arr);
  const min = Math.min(...arr);
  const range = max - min + 1;
  const count = new Array(range).fill(0);

  // min을 빼서 0-based 인덱스로 변환 (음수도 처리 가능)
  for (const num of arr) count[num - min]++;
  for (let i = 1; i < range; i++) count[i] += count[i - 1];

  const result = new Array(arr.length);
  // 뒤에서부터 순회해서 안정 정렬(같은 값의 원래 순서) 유지
  for (let i = arr.length - 1; i >= 0; i--) {
    // count를 먼저 1 감소시켜서 결과 배열의 위치를 결정
    const pos = --count[arr[i]! - min];
    result[pos] = arr[i];
  }
  return result;
}

export { mergeSort, quickSort, countingSort };
