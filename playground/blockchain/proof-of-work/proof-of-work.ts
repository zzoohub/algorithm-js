// ============================================
// Proof of Work (작업 증명)
// ============================================
// "건초 더미에서 바늘 찾기" — 찾는 건 엄청 어렵지만, 검증은 한 번에.
//
// 왜 계산은 어렵고 검증은 쉬운가?
// - 해시 함수의 역상 저항성: hash(입력) → 출력은 빠르지만, 출력 → 입력은 불가능
// - 유일한 방법: nonce를 0, 1, 2, ... 하나씩 바꿔가며 해시를 계산 (brute force)
// - 검증할 땐? nonce를 넣고 해시 한 번만 계산하면 끝
//
// 왜 난이도를 조정하는가?
// - 채굴자가 늘어나면 블록이 너무 빨리 발견됨
// - 비트코인은 ~10분 간격을 유지하기 위해 2016블록(약 2주)마다 난이도 조정
// - 난이도 ↑ = 필요한 선행 0의 수 ↑ = 평균 시도 횟수 기하급수적 ↑

// ============================================
// FNV-1a 해시 함수 (데모용 간이 해시)
// ============================================
// 실제 블록체인은 SHA-256을 사용하지만,
// 여기서는 PoW의 원리를 빠르게 체험하기 위해 FNV-1a를 사용.
// FNV-1a: 빠르고 간단한 비암호학적 해시. 분포가 균일하여 데모에 적합.
function fnv1aHash(input: string): string {
  // FNV offset basis와 prime (32비트 버전)
  let hash = 0x811c9dc5;
  const FNV_PRIME = 0x01000193;

  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    // 곱셈 후 32비트로 잘라냄 (Math.imul은 32비트 정수 곱셈)
    hash = Math.imul(hash, FNV_PRIME);
  }

  // 부호 없는 32비트 정수로 변환 후 hex 문자열로
  return (hash >>> 0).toString(16).padStart(8, "0");
}

// ============================================
// 채굴 (Mining)
// ============================================
// data + nonce를 합쳐서 해시를 구하고,
// 해시가 difficulty개의 0으로 시작하는 nonce를 찾을 때까지 반복.
//
// 예: difficulty=3이면 "000xxxxx" 형태의 해시를 찾아야 함.
// 해시의 각 자리가 hex(0~f)이므로, 한 자리가 0일 확률 = 1/16.
// difficulty개의 0이 연속될 확률 = (1/16)^difficulty.
// → 난이도가 1 늘 때마다 기대 시도 횟수가 16배 증가!
interface MineResult {
  nonce: number;     // 정답 nonce
  hash: string;      // 해당 nonce로 만든 해시
  attempts: number;  // 총 시도 횟수
  timeMs: number;    // 소요 시간 (밀리초)
}

function mine(data: string, difficulty: number): MineResult {
  // 목표: 해시 앞부분이 이 prefix와 일치해야 함
  const targetPrefix = "0".repeat(difficulty);
  let nonce = 0;

  const startTime = performance.now();

  // nonce를 0부터 1씩 증가시키며 조건을 만족하는 해시를 찾는다
  // 이것이 "작업 증명"의 "작업" — 단순 반복 외에 지름길이 없다
  while (true) {
    const input = `${data}:${nonce}`;
    const hash = fnv1aHash(input);

    if (hash.startsWith(targetPrefix)) {
      const timeMs = performance.now() - startTime;
      return {
        nonce,
        hash,
        attempts: nonce + 1, // nonce는 0부터 시작하므로 +1
        timeMs,
      };
    }

    nonce++;
  }
}

// ============================================
// 검증 (Verification)
// ============================================
// 채굴에는 수천~수백만 번의 시도가 필요하지만,
// 검증은 딱 한 번의 해시 계산으로 끝난다.
// 이 비대칭성이 PoW의 핵심이자 블록체인 보안의 근간.
function verifyPoW(data: string, nonce: number, difficulty: number): boolean {
  const input = `${data}:${nonce}`;
  const hash = fnv1aHash(input);
  const targetPrefix = "0".repeat(difficulty);

  return hash.startsWith(targetPrefix);
}

// ============================================
// 난이도 조정 (Difficulty Adjustment)
// ============================================
// 비트코인의 난이도 조정 메커니즘을 단순화한 시뮬레이션.
//
// 실제 비트코인:
// - 2016블록마다 (약 2주) 조정
// - 목표 시간: 블록당 ~10분
// - 조정 공식: 새 난이도 = 현재 난이도 * (목표 시간 / 실제 시간)
// - 안전장치: 한 번에 최대 4배까지만 변경 가능 (급격한 변동 방지)
//
// 여기서는 정수 난이도로 단순화:
// - 블록 생성이 너무 빠르면 → 난이도 1 증가
// - 블록 생성이 너무 느리면 → 난이도 1 감소 (최소 1)
function adjustDifficulty(
  lastBlockTimeMs: number,  // 마지막 블록 생성에 걸린 시간 (밀리초)
  targetTimeMs: number,     // 목표 블록 생성 시간 (밀리초)
  currentDifficulty: number // 현재 난이도
): number {
  const ratio = lastBlockTimeMs / targetTimeMs;

  if (ratio < 0.5) {
    // 목표의 절반도 안 걸림 → 너무 쉬움 → 난이도 ↑
    return currentDifficulty + 1;
  } else if (ratio > 2.0) {
    // 목표의 2배 이상 걸림 → 너무 어려움 → 난이도 ↓
    return Math.max(1, currentDifficulty - 1);
  }

  // 적정 범위 내 → 난이도 유지
  return currentDifficulty;
}

// ============================================
// 데모: 난이도별 채굴 시연
// ============================================
// 난이도가 1 증가할 때마다 시도 횟수가 어떻게 변하는지 체감하기.
// (hex 기준) 난이도 1→2→3 : 기대값 16→256→4096 시도
function demo(): void {
  console.log("=== Proof of Work 데모 ===\n");

  const data = "블록 #12345 | 이전해시: abc123 | 거래: Alice→Bob 1BTC";

  // --- 난이도별 채굴 ---
  for (const difficulty of [1, 2, 3]) {
    console.log(`--- 난이도 ${difficulty} (선행 0: ${"0".repeat(difficulty)}xxxxxxxx) ---`);
    console.log(`기대 시도 횟수: ~${Math.pow(16, difficulty)}회 (16^${difficulty})\n`);

    const result = mine(data, difficulty);

    console.log(`  nonce:    ${result.nonce}`);
    console.log(`  hash:     ${result.hash}`);
    console.log(`  시도 횟수: ${result.attempts.toLocaleString()}회`);
    console.log(`  소요 시간: ${result.timeMs.toFixed(2)}ms`);
    console.log();
  }

  // --- 검증 데모 ---
  console.log("=== 검증 데모 ===\n");

  const mined = mine(data, 2);
  console.log(`채굴 결과: nonce=${mined.nonce}, hash=${mined.hash}`);
  console.log(`  (${mined.attempts.toLocaleString()}회 시도, ${mined.timeMs.toFixed(2)}ms 소요)\n`);

  // 올바른 nonce로 검증 → true (해시 1번 계산)
  const valid = verifyPoW(data, mined.nonce, 2);
  console.log(`올바른 nonce(${mined.nonce})로 검증: ${valid}`);
  console.log("  → 해시 1번 계산으로 즉시 확인!\n");

  // 틀린 nonce로 검증 → false
  const invalid = verifyPoW(data, mined.nonce + 1, 2);
  console.log(`틀린 nonce(${mined.nonce + 1})로 검증: ${invalid}`);
  console.log("  → 역시 해시 1번 계산, 즉시 거부!\n");

  // 핵심: 채굴은 N번 시도, 검증은 1번. 이 비대칭이 PoW의 본질.
  console.log("핵심: 채굴은 수천 번 시도하지만, 검증은 단 1번.");
  console.log("      이 비대칭성이 블록체인의 보안을 만든다.\n");

  // --- 난이도 조정 데모 ---
  console.log("=== 난이도 조정 시뮬레이션 ===\n");

  const TARGET_TIME = 100; // 목표: 100ms (실제 비트코인은 10분)
  let currentDifficulty = 1;

  for (let block = 1; block <= 6; block++) {
    const result = mine(`block-${block}`, currentDifficulty);
    const newDifficulty = adjustDifficulty(result.timeMs, TARGET_TIME, currentDifficulty);

    console.log(
      `블록 #${block}: 난이도=${currentDifficulty}, ` +
      `시간=${result.timeMs.toFixed(1)}ms, ` +
      `시도=${result.attempts.toLocaleString()}회 → ` +
      `다음 난이도=${newDifficulty}`
    );

    currentDifficulty = newDifficulty;
  }

  console.log("\n→ 블록 생성이 너무 빠르면 난이도 ↑, 너무 느리면 ↓");
  console.log("  비트코인은 이 원리로 ~10분 간격을 유지한다.");
}

// 실행
demo();

export { fnv1aHash, mine, verifyPoW, adjustDifficulty };
