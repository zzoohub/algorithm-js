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
  // 피벗을 중간값(median of three)으로 선택해서 최악의 경우를 줄임
  const mid = Math.floor((low + high) / 2);
  if (arr[low]! > arr[mid]!) [arr[low], arr[mid]] = [arr[mid]!, arr[low]!];
  if (arr[low]! > arr[high]!) [arr[low], arr[high]] = [arr[high]!, arr[low]!];
  if (arr[mid]! > arr[high]!) [arr[mid], arr[high]] = [arr[high]!, arr[mid]!];
  [arr[mid], arr[high]] = [arr[high]!, arr[mid]!]; // 피벗을 끝으로

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

  for (const num of arr) count[num - min]++;
  for (let i = 1; i < range; i++) count[i] += count[i - 1];

  const result = new Array(arr.length);
  // 뒤에서부터 순회해서 안정 정렬 유지
  for (let i = arr.length - 1; i >= 0; i--) {
    const pos = --count[arr[i]! - min];
    result[pos] = arr[i];
  }
  return result;
}

export { mergeSort, quickSort, countingSort };
