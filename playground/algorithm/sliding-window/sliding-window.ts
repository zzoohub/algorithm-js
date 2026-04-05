// ============================================
// 1. 고정 크기 슬라이딩 윈도우
// ============================================
// 크기 k인 연속 부분 배열의 최대 합
function maxSumSubarray(arr: number[], k: number): number {
  if (arr.length < k) return -1;

  // 첫 번째 윈도우의 합
  let windowSum = 0;
  for (let i = 0; i < k; i++) windowSum += arr[i]!;

  let maxSum = windowSum;

  // 윈도우를 한 칸씩 밀면서 앞을 빼고 뒤를 더한다
  for (let i = k; i < arr.length; i++) {
    windowSum += arr[i]! - arr[i - k]!;
    maxSum = Math.max(maxSum, windowSum);
  }

  return maxSum;
}

// ============================================
// 2. 가변 크기 슬라이딩 윈도우
// ============================================
// 합이 target 이상인 최소 길이 부분 배열
function minSubarrayLen(arr: number[], target: number): number {
  let left = 0;
  let sum = 0;
  let minLen = Infinity;

  for (let right = 0; right < arr.length; right++) {
    sum += arr[right]!;

    // 조건을 만족하면 왼쪽을 줄여본다
    while (sum >= target) {
      minLen = Math.min(minLen, right - left + 1);
      sum -= arr[left]!;
      left++;
    }
  }

  return minLen === Infinity ? 0 : minLen;
}

// ============================================
// 3. 투 포인터 — 정렬된 배열에서 두 수의 합
// ============================================
function twoSum(arr: number[], target: number): [number, number] | null {
  let left = 0, right = arr.length - 1;

  while (left < right) {
    const sum = arr[left]! + arr[right]!;
    if (sum === target) return [left, right];
    if (sum < target) left++;
    else right--;
  }

  return null;
}

// ============================================
// 4. 중복 없는 최장 부분 문자열
// ============================================
function lengthOfLongestSubstring(s: string): number {
  const lastSeen = new Map<string, number>();
  let maxLen = 0;
  let left = 0;

  for (let right = 0; right < s.length; right++) {
    const ch = s[right]!;
    // 이미 본 문자가 윈도우 안에 있으면 left를 이동
    if (lastSeen.has(ch) && lastSeen.get(ch)! >= left) {
      left = lastSeen.get(ch)! + 1;
    }
    lastSeen.set(ch, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }

  return maxLen;
}

// ============================================
// 5. 슬라이딩 윈도우 최대값 (Deque 활용)
// ============================================
function maxSlidingWindow(nums: number[], k: number): number[] {
  const result: number[] = [];
  const deque: number[] = []; // 인덱스를 저장 (앞쪽이 최대값)

  for (let i = 0; i < nums.length; i++) {
    // 윈도우를 벗어난 인덱스 제거
    while (deque.length > 0 && deque[0]! <= i - k) {
      deque.shift();
    }
    // 현재 값보다 작은 것들은 제거 (더 이상 최대값이 될 수 없음)
    while (deque.length > 0 && nums[deque.at(-1)!]! <= nums[i]!) {
      deque.pop();
    }
    deque.push(i);

    // 윈도우가 k개를 채웠으면 결과 기록
    if (i >= k - 1) {
      result.push(nums[deque[0]!]!);
    }
  }

  return result;
}

export {
  maxSumSubarray,
  minSubarrayLen,
  twoSum,
  lengthOfLongestSubstring,
  maxSlidingWindow,
};
