// ============================================
// 기본 비트 연산들
// ============================================

// i번째 비트가 1인지 확인
function getBit(num: number, i: number): boolean {
  return (num & (1 << i)) !== 0;
}

// i번째 비트를 1로 설정
function setBit(num: number, i: number): number {
  return num | (1 << i);
}

// i번째 비트를 0으로 설정
function clearBit(num: number, i: number): number {
  return num & ~(1 << i);
}

// i번째 비트를 토글
function toggleBit(num: number, i: number): number {
  return num ^ (1 << i);
}

// ============================================
// 실용적인 비트 트릭들
// ============================================

// 2의 거듭제곱인지 확인
// 원리: 2^n은 비트가 하나만 1이다. n & (n-1)은 가장 낮은 1비트를 끈다.
// 8  = 1000
// 7  = 0111
// &  = 0000 → 0이면 2의 거듭제곱
function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}

// 1인 비트 개수 세기 (popcount / Hamming weight)
function countBits(n: number): number {
  let count = 0;
  while (n > 0) {
    n &= (n - 1); // 가장 낮은 1비트를 끈다
    count++;
  }
  return count;
}

// 두 수의 XOR — 같은 비트는 0, 다른 비트는 1
// 배열에서 하나만 홀수 개인 수 찾기
// [2, 3, 2, 4, 3] → 2^3^2^4^3 = 4
function findSingle(nums: number[]): number {
  let result = 0;
  for (const num of nums) result ^= num;
  return result;
}

// XOR 스왑 (추가 변수 없이 교환)
function xorSwap(a: number, b: number): [number, number] {
  a ^= b;
  b ^= a;
  a ^= b;
  return [a, b];
}

// ============================================
// 비트마스크 — 집합을 정수로 표현
// ============================================

// 부분집합 열거: 원소 n개의 모든 부분집합을 비트마스크로 표현
function allSubsets(n: number): number[][] {
  const result: number[][] = [];
  for (let mask = 0; mask < (1 << n); mask++) {
    const subset: number[] = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) subset.push(i);
    }
    result.push(subset);
  }
  return result;
}

// 권한 시스템 예시
const PERMISSION = {
  READ:    0b001,  // 1
  WRITE:   0b010,  // 2
  EXECUTE: 0b100,  // 4
} as const;

function hasPermission(userPerm: number, required: number): boolean {
  return (userPerm & required) === required;
}

function addPermission(userPerm: number, perm: number): number {
  return userPerm | perm;
}

function removePermission(userPerm: number, perm: number): number {
  return userPerm & ~perm;
}

export {
  getBit, setBit, clearBit, toggleBit,
  isPowerOfTwo, countBits, findSingle, xorSwap,
  allSubsets,
  PERMISSION, hasPermission, addPermission, removePermission,
};
