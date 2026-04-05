// ============================================
// 1. 피보나치 — DP의 가장 기본적인 예
// ============================================

// Top-down (메모이제이션) — 재귀 + 캐시
function fibMemo(n: number, memo = new Map<number, number>()): number {
  if (n <= 1) return n;
  if (memo.has(n)) return memo.get(n)!;
  const result = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  memo.set(n, result);
  return result;
}

// Bottom-up (타뷸레이션) — 작은 문제부터 채워나가기
function fibTab(n: number): number {
  if (n <= 1) return n;
  let prev2 = 0, prev1 = 1;
  for (let i = 2; i <= n; i++) {
    const current = prev1 + prev2;
    prev2 = prev1;
    prev1 = current;
  }
  return prev1;
}

// ============================================
// 2. 0/1 배낭 문제 (Knapsack)
// ============================================
// 각 아이템을 넣거나(1) 안 넣거나(0) 선택해서 가치를 최대화
function knapsack(
  weights: number[],
  values: number[],
  capacity: number
): number {
  const n = weights.length;
  // dp[i][w] = i번째 아이템까지 고려했을 때, 용량 w에서의 최대 가치
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(capacity + 1).fill(0)
  );

  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      // 안 넣는 경우
      dp[i]![w] = dp[i - 1]![w]!;
      // 넣는 경우 (용량이 충분하면)
      if (weights[i - 1]! <= w) {
        dp[i]![w] = Math.max(
          dp[i]![w]!,
          dp[i - 1]![w - weights[i - 1]!]! + values[i - 1]!
        );
      }
    }
  }

  return dp[n]![capacity]!;
}

// ============================================
// 3. 최장 공통 부분수열 (LCS)
// ============================================
function lcs(a: string, b: string): string {
  const m = a.length, n = b.length;
  // dp[i][j] = a[0..i-1]과 b[0..j-1]의 LCS 길이
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i]![j] = dp[i - 1]![j - 1]! + 1;
      } else {
        dp[i]![j] = Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!);
      }
    }
  }

  // 역추적으로 실제 문자열 복원
  let result = "";
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      result = a[i - 1] + result;
      i--; j--;
    } else if (dp[i - 1]![j]! > dp[i]![j - 1]!) {
      i--;
    } else {
      j--;
    }
  }

  return result;
}

// ============================================
// 4. 동전 교환 (Coin Change)
// ============================================
// 최소 동전 개수로 금액 만들기
function coinChange(coins: number[], amount: number): number {
  // dp[i] = 금액 i를 만드는 최소 동전 수
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i && dp[i - coin] + 1 < dp[i]) {
        dp[i] = dp[i - coin] + 1;
      }
    }
  }

  return dp[amount] === Infinity ? -1 : dp[amount];
}

// ============================================
// 5. 최장 증가 부분수열 (LIS)
// ============================================
function lis(nums: number[]): number {
  if (nums.length === 0) return 0;

  // tails[i] = 길이 i+1인 증가 수열의 마지막 원소의 최솟값
  const tails: number[] = [];

  for (const num of nums) {
    // 이진 탐색으로 num이 들어갈 위치를 찾는다
    let lo = 0, hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1; // Math.floor((lo + hi) / 2) 와 동일
      if (tails[mid]! < num) lo = mid + 1;
      else hi = mid;
    }
    tails[lo] = num;
  }

  return tails.length;
}

export { fibMemo, fibTab, knapsack, lcs, coinChange, lis };
