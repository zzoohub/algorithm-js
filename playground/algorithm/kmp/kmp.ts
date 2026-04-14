// ============================================
// KMP (Knuth-Morris-Pratt) 문자열 매칭
// ============================================
// 텍스트에서 패턴을 O(n+m)에 찾는 알고리즘.
// 나이브 매칭은 불일치 시 텍스트 포인터를 되돌리지만,
// KMP는 "이미 일치한 부분의 정보"를 활용해서 되돌리지 않는다.
//
// 핵심: Failure Function (실패 함수, π 함수)
// failure[i] = 패턴의 0~i 부분에서 "접두사 = 접미사"인 최대 길이
//
// 예) 패턴 "ABCABD"
//   A B C A B D
//   0 0 0 1 2 0
//         ^ ^
//         AB가 접두사이자 접미사
//
// 왜 이게 중요한가?
// "ABCAB"까지 일치한 후 D에서 불일치하면,
// "AB"가 접두사이자 접미사이므로 패턴을 "AB" 위치로 밀어서
// 텍스트를 되돌리지 않고 계속 비교할 수 있다.
//
// 텍스트:  A B C A B C A B D
// 패턴:    A B C A B D       ← D에서 불일치
//                ↓ failure[4]=2이므로 패턴을 2칸 뒤로
//              A B C A B D   ← AB는 이미 일치했으니 C부터 비교!

// ============================================
// 1. Failure Function (실패 함수) 구축 — O(m)
// ============================================
// failure[i] = pattern[0..i]에서 proper prefix이면서 suffix인 가장 긴 것의 길이
// "proper"이므로 자기 자신 전체는 제외
function buildFailure(pattern: string): number[] {
  const m = pattern.length;
  const failure = new Array(m).fill(0);

  // j: 현재까지 일치한 접두사 길이
  let j = 0;

  for (let i = 1; i < m; i++) {
    // 불일치 시: j를 failure[j-1]로 되돌린다
    // (이미 일치한 접두사의 "접두사=접미사" 정보를 활용)
    while (j > 0 && pattern[i] !== pattern[j]) {
      j = failure[j - 1]!;
    }

    if (pattern[i] === pattern[j]) {
      j++;
    }

    failure[i] = j;
  }

  return failure;
}

// ============================================
// 2. KMP 검색 — O(n + m)
// ============================================
function kmpSearch(text: string, pattern: string): number[] {
  if (pattern.length === 0) return [];

  const failure = buildFailure(pattern);
  const matches: number[] = [];
  const n = text.length, m = pattern.length;

  // j: 패턴에서 현재 비교 위치
  let j = 0;

  for (let i = 0; i < n; i++) {
    // 불일치 시: failure 함수를 따라 패턴을 "밀어넣기"
    // 텍스트 포인터 i는 절대 되돌아가지 않는다! (핵심)
    while (j > 0 && text[i] !== pattern[j]) {
      j = failure[j - 1]!;
    }

    if (text[i] === pattern[j]) {
      j++;
    }

    // 패턴 전체가 일치!
    if (j === m) {
      matches.push(i - m + 1); // 일치 시작 위치
      j = failure[j - 1]!;     // 다음 일치를 찾기 위해 계속
    }
  }

  return matches;
}

// ============================================
// 3. Rabin-Karp (롤링 해시 매칭) — 비교용
// ============================================
// 다른 접근: 패턴의 해시와 텍스트 윈도우의 해시를 비교.
// 해시가 같으면 실제 문자열을 비교 (해시 충돌 확인).
// "롤링 해시"로 윈도우를 한 칸 밀 때 O(1)에 해시 갱신.
//
// KMP보다 구현이 간단하고, 다중 패턴 매칭에 강점.
function rabinKarp(text: string, pattern: string): number[] {
  const n = text.length, m = pattern.length;
  if (m > n) return [];

  const matches: number[] = [];
  const BASE = 31;
  const MOD = 1_000_000_007;

  // 패턴의 해시 계산
  let patternHash = 0;
  let windowHash = 0;
  let basePow = 1; // BASE^(m-1) % MOD

  for (let i = 0; i < m; i++) {
    patternHash = (patternHash * BASE + pattern.charCodeAt(i)) % MOD;
    windowHash = (windowHash * BASE + text.charCodeAt(i)) % MOD;
    if (i > 0) basePow = (basePow * BASE) % MOD;
  }

  for (let i = 0; i <= n - m; i++) {
    // 해시가 같으면 실제 비교 (충돌 방지)
    if (windowHash === patternHash && text.slice(i, i + m) === pattern) {
      matches.push(i);
    }

    // 롤링 해시: 왼쪽 문자 빼고 오른쪽 문자 추가
    if (i < n - m) {
      windowHash = (
        (windowHash - text.charCodeAt(i) * basePow % MOD + MOD) * BASE
        + text.charCodeAt(i + m)
      ) % MOD;
    }
  }

  return matches;
}

export { buildFailure, kmpSearch, rabinKarp };
