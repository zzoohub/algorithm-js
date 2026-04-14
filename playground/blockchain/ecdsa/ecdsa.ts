// ============================================
// ECDSA (Elliptic Curve Digital Signature Algorithm)
// ============================================
// 타원곡선 위의 점 연산을 이용한 디지털 서명 알고리즘.
// 블록체인에서 지갑 생성과 거래 서명의 핵심.
//
// 타원곡선이란?
//   y² = x³ + ax + b (mod p) 형태의 방정식을 만족하는 점들의 집합.
//   이 곡선 위의 점들은 "덧셈"이라는 연산으로 군(group)을 형성.
//   → 점 P를 n번 더하면 (스칼라 곱) Q = nP 를 쉽게 계산할 수 있지만
//   → Q와 P가 주어졌을 때 n을 찾는 것은 극히 어렵다 (이산로그 문제)
//   이것이 공개키 암호의 기반!
//
// 왜 타원곡선인가?
//   RSA: 같은 보안 수준에 3072비트 키 필요
//   ECDSA: 256비트 키로 동일 보안 달성 → 12배 작은 키!
//   → 블록체인에서 매 거래마다 서명을 저장하므로 크기 절약이 중요
//
// 비트코인/이더리움에서:
//   - 개인키 → 공개키 → 지갑 주소 (단방향)
//   - 거래할 때 개인키로 서명 → 누구나 공개키로 검증
//   - 개인키를 공개하지 않고도 소유권을 증명할 수 있음

// ============================================
// 유한체(Finite Field) 위의 모듈러 산술
// ============================================
// 실제 secp256k1은 256비트 소수를 사용하지만,
// 학습용으로 작은 소수체를 사용하여 원리를 이해한다.

// ============================================
// 왜 이 함수들이 필요한가? (개념 요약)
// ============================================
// 타원곡선 암호의 핵심 비대칭:
//   공개키 Q = 개인키 n × 생성점 G  (스칼라 곱)
//   → n이 주어지면 Q를 구하기 쉬움 (O(log n) — pointAdd를 반복)
//   → Q가 주어져도 n을 역산하기 불가능 (이산 로그 문제)
//   이 "쉬운 방향 vs 어려운 방향"이 공개키 암호의 기반!
//
// modInverse: 유한체에서 나눗셈 대신 역원을 곱함
// pointAdd: 곡선 위 두 점을 더하는 기하학적 연산
// scalarMultiply: 점을 n번 더하기 (double-and-add로 빠르게)

/**
 * 모듈러 역원 (확장 유클리드 알고리즘)
 * a * a⁻¹ ≡ 1 (mod m) 인 a⁻¹를 구한다.
 * 나눗셈 대신 사용: a/b mod p = a * b⁻¹ mod p
 */
function modInverse(a: number, m: number): number {
  // a를 양수로 정규화
  a = ((a % m) + m) % m;

  // 확장 유클리드 알고리즘
  let [old_r, r] = [a, m];
  let [old_s, s] = [1, 0];

  while (r !== 0) {
    const quotient = Math.floor(old_r / r);
    [old_r, r] = [r, old_r - quotient * r];
    [old_s, s] = [s, old_s - quotient * s];
  }

  return ((old_s % m) + m) % m;
}

/** 양수 모듈러 연산 (음수 방지) */
function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

// ============================================
// 타원곡선 점(Point) 정의
// ============================================
// 타원곡선 위의 점은 (x, y) 좌표.
// 특수한 "무한원점"(O)은 덧셈의 항등원 역할.
// P + O = P (어떤 점에 무한원점을 더하면 자기 자신)

/** 타원곡선 위의 점 */
interface Point {
  x: number;
  y: number;
}

/** 무한원점 (항등원) — null로 표현 */
type CurvePoint = Point | null;

// ============================================
// 타원곡선 매개변수 (학습용 소규모 곡선)
// ============================================
// 실제 secp256k1: y² = x³ + 7 (mod p), p = 2²⁵⁶ - 2³² - 977
// 여기서는 원리를 보여주기 위해 작은 소수체를 사용.
//
// 곡선: y² = x³ + 2x + 3 (mod 97)
// 생성점(Generator): G = (3, 6)
// 위수(Order): n = 5 (G를 5번 더하면 무한원점으로 돌아옴)

const CURVE = {
  a: 2,   // 곡선 계수 a
  b: 3,   // 곡선 계수 b
  p: 97,  // 유한체의 소수 (모든 연산은 mod p)
};

/** 생성점 (Generator Point): 곡선 위의 기준점 */
const G: Point = { x: 3, y: 6 };

/** 위수 (Order): nG = O (무한원점) 인 가장 작은 양의 정수 n */
const N = 5;

// ============================================
// 점이 곡선 위에 있는지 검증
// ============================================
function isOnCurve(point: CurvePoint): boolean {
  if (point === null) return true; // 무한원점은 항상 곡선 위
  const { x, y } = point;
  // y² ≡ x³ + ax + b (mod p) 인지 확인
  const left = mod(y * y, CURVE.p);
  const right = mod(x * x * x + CURVE.a * x + CURVE.b, CURVE.p);
  return left === right;
}

// ============================================
// 타원곡선 점 덧셈 (Point Addition)
// ============================================
// 두 점 P, Q를 지나는 직선이 곡선과 만나는 세 번째 점 R'을
// x축으로 반사한 것이 P + Q.
//
// 기하학적 의미:
//   P ≠ Q: 두 점을 잇는 직선의 기울기로 계산
//   P = Q: 접선의 기울기로 계산 (점 더블링)
//   P = -Q: 결과는 무한원점 O (수직선)

function pointAdd(P: CurvePoint, Q: CurvePoint): CurvePoint {
  // 항등원 처리: P + O = P, O + Q = Q
  if (P === null) return Q;
  if (Q === null) return P;

  const { p, a } = CURVE;

  // P + (-P) = O (x가 같고 y가 다르면 역원)
  if (P.x === Q.x && P.y !== Q.y) {
    return null; // 무한원점
  }

  let slope: number;

  if (P.x === Q.x && P.y === Q.y) {
    // ── 점 더블링 (Point Doubling): P = Q ──
    // 접선의 기울기: λ = (3x² + a) / (2y) mod p
    // y = 0이면 접선이 수직 → 결과는 무한원점
    if (P.y === 0) return null;
    slope = mod(
      (3 * P.x * P.x + a) * modInverse(2 * P.y, p),
      p
    );
  } else {
    // ── 점 덧셈 (P ≠ Q) ──
    // 두 점을 잇는 직선의 기울기: λ = (y₂ - y₁) / (x₂ - x₁) mod p
    slope = mod(
      (Q.y - P.y) * modInverse(Q.x - P.x, p),
      p
    );
  }

  // 새로운 점의 좌표 계산
  // x₃ = λ² - x₁ - x₂ (mod p)
  // y₃ = λ(x₁ - x₃) - y₁ (mod p)
  const xR = mod(slope * slope - P.x - Q.x, p);
  const yR = mod(slope * (P.x - xR) - P.y, p);

  return { x: xR, y: yR };
}

// ============================================
// 스칼라 곱 (Scalar Multiplication)
// ============================================
// k * P = P + P + ... + P (k번)
// "더블 앤 애드" 방식으로 O(log k) 번의 연산으로 계산.
//
// 예: 11P = 8P + 2P + P
//   11 = 1011₂ → 비트를 순회하며:
//     비트=1: 더블 + 더하기
//     비트=0: 더블만
//
// 이것이 핵심! Q = kP는 쉽지만, Q와 P로부터 k를 찾는 건
// 이산로그 문제(ECDLP)로 계산적으로 불가능.

function scalarMultiply(k: number, P: CurvePoint): CurvePoint {
  if (P === null || k === 0) return null;

  // k를 양수로 정규화 (음수면 점을 반사)
  if (k < 0) {
    k = -k;
    if (P !== null) P = { x: P.x, y: mod(-P.y, CURVE.p) };
  }

  let result: CurvePoint = null;  // 무한원점에서 시작
  let current: CurvePoint = P;    // 현재 2^i * P

  // 이진 전개법 (Double-and-Add)
  while (k > 0) {
    if (k & 1) {
      // 현재 비트가 1이면 result에 더함
      result = pointAdd(result, current);
    }
    current = pointAdd(current, current); // 더블링: 2^i → 2^(i+1)
    k >>= 1; // 다음 비트로
  }

  return result;
}

// ============================================
// 키 생성 (Key Generation)
// ============================================
// 1. 개인키: 1 ~ n-1 사이의 랜덤 정수 선택
// 2. 공개키: Q = d * G (개인키 × 생성점)
//
// 개인키 d를 알면 공개키 Q를 쉽게 계산하지만,
// Q와 G를 알아도 d를 역산하는 것은 불가능 (ECDLP).

interface KeyPair {
  privateKey: number;
  publicKey: Point;
}

function generateKeyPair(): KeyPair {
  // 1 ~ N-1 사이의 랜덤 정수를 개인키로 선택
  const privateKey = Math.floor(Math.random() * (N - 1)) + 1;

  // 공개키 = 개인키 × 생성점
  const publicKey = scalarMultiply(privateKey, G) as Point;

  return { privateKey, publicKey };
}

// ============================================
// 디지털 서명 (Sign)
// ============================================
// 메시지 해시 e와 개인키 d로 서명 (r, s)를 생성.
//
// 서명 과정:
//   1. 랜덤 k 선택 (1 ~ n-1, 일회용 넌스)
//   2. R = k * G 계산
//   3. r = R.x mod n (r ≠ 0 이어야 함)
//   4. s = k⁻¹ * (e + r * d) mod n (s ≠ 0 이어야 함)
//   5. 서명 = (r, s)
//
// 핵심: k는 반드시 매번 새로운 랜덤이어야 한다!
// PS3 해킹 사건: 소니가 k를 고정 → 개인키 노출!

interface Signature {
  r: number;
  s: number;
}

function sign(privateKey: number, messageHash: number): Signature {
  let r: number, s: number, k: number;

  do {
    // 1. 일회용 랜덤 k 선택 (실제로는 RFC 6979 결정적 방식 사용)
    k = Math.floor(Math.random() * (N - 1)) + 1;

    // 2. R = k * G (곡선 위의 점)
    const R = scalarMultiply(k, G) as Point;

    // 3. r = R.x mod n
    r = mod(R.x, N);
    if (r === 0) continue; // r이 0이면 다시 시도

    // 4. s = k⁻¹ * (messageHash + r * privateKey) mod n
    const kInv = modInverse(k, N);
    s = mod(kInv * (messageHash + r * privateKey), N);
  } while (r === 0 || s === 0); // r, s 모두 0이 아니어야 유효

  return { r, s };
}

// ============================================
// 서명 검증 (Verify)
// ============================================
// 공개키 Q, 메시지 해시 e, 서명 (r, s)로 서명의 유효성 확인.
//
// 검증 과정:
//   1. s⁻¹ mod n 계산
//   2. u₁ = e * s⁻¹ mod n
//   3. u₂ = r * s⁻¹ mod n
//   4. R' = u₁ * G + u₂ * Q
//   5. R'.x mod n === r 이면 유효!
//
// 왜 이게 작동하는가?
//   s = k⁻¹(e + rd) 이므로 k = s⁻¹(e + rd) = s⁻¹e + s⁻¹rd = u₁ + u₂d
//   따라서 R' = u₁G + u₂Q = u₁G + u₂(dG) = (u₁ + u₂d)G = kG = R
//   즉, 올바른 개인키로 서명했다면 R'.x가 r과 일치!

function verify(
  publicKey: Point,
  messageHash: number,
  signature: Signature
): boolean {
  const { r, s } = signature;

  // 기본 유효성 검사
  if (r <= 0 || r >= N || s <= 0 || s >= N) return false;
  if (!isOnCurve(publicKey)) return false;

  // 1. s의 모듈러 역원
  const sInv = modInverse(s, N);

  // 2-3. u₁, u₂ 계산
  const u1 = mod(messageHash * sInv, N);
  const u2 = mod(r * sInv, N);

  // 4. R' = u₁G + u₂Q
  const point1 = scalarMultiply(u1, G);
  const point2 = scalarMultiply(u2, publicKey);
  const R = pointAdd(point1, point2);

  // 무한원점이면 서명 무효
  if (R === null) return false;

  // 5. R'.x mod n === r 이면 유효
  return mod(R.x, N) === r;
}

// ============================================
// 데모: 키 생성 → 서명 → 검증
// ============================================
function demo(): void {
  console.log("=== ECDSA 디지털 서명 데모 ===\n");

  // 곡선 매개변수 출력
  console.log("타원곡선 매개변수:");
  console.log(`  곡선: y² = x³ + ${CURVE.a}x + ${CURVE.b} (mod ${CURVE.p})`);
  console.log(`  생성점 G = (${G.x}, ${G.y})`);
  console.log(`  위수 n = ${N}`);
  console.log(`  G가 곡선 위에 있는가? ${isOnCurve(G)}`);
  console.log();

  // 스칼라 곱 시연: G, 2G, 3G, ... 계산
  console.log("스칼라 곱 시연 (kG):");
  for (let k = 1; k <= N; k++) {
    const point = scalarMultiply(k, G);
    if (point === null) {
      console.log(`  ${k}G = O (무한원점) → ${k} = n이므로 순환 완료!`);
    } else {
      console.log(`  ${k}G = (${point.x}, ${point.y})  곡선 위? ${isOnCurve(point)}`);
    }
  }
  console.log();

  // 1. 키 생성
  console.log("── 1단계: 키 생성 ──");
  const { privateKey, publicKey } = generateKeyPair();
  console.log(`  개인키 (비밀): d = ${privateKey}`);
  console.log(`  공개키 (공개): Q = (${publicKey.x}, ${publicKey.y})`);
  console.log(`  검증: ${privateKey} × G = Q? ${isOnCurve(publicKey)}`);
  console.log();

  // 2. 서명
  console.log("── 2단계: 메시지 서명 ──");
  const messageHash = 4; // 실제로는 SHA-256 해시의 정수값
  console.log(`  메시지 해시: e = ${messageHash}`);
  const signature = sign(privateKey, messageHash);
  console.log(`  서명: (r=${signature.r}, s=${signature.s})`);
  console.log();

  // 3. 검증
  console.log("── 3단계: 서명 검증 ──");
  const isValid = verify(publicKey, messageHash, signature);
  console.log(`  올바른 공개키로 검증: ${isValid ? "유효 ✓" : "무효 ✗"}`);

  // 잘못된 메시지로 검증 (변조 감지)
  const tamperedHash = 2;
  const isValidTampered = verify(publicKey, tamperedHash, signature);
  console.log(`  변조된 메시지로 검증: ${isValidTampered ? "유효 ✓" : "무효 ✗"} (변조 감지!)`);

  // 잘못된 공개키로 검증
  const fakeKey = scalarMultiply(
    (privateKey % (N - 1)) + 1, // 다른 개인키
    G
  ) as Point;
  // 진짜 다른 공개키인지 확인
  if (fakeKey.x !== publicKey.x || fakeKey.y !== publicKey.y) {
    const isValidFake = verify(fakeKey, messageHash, signature);
    console.log(`  다른 공개키로 검증:   ${isValidFake ? "유효 ✓" : "무효 ✗"} (위조 불가!)`);
  }
  console.log();

  // 블록체인 시나리오
  console.log("── 블록체인 시나리오 ──");
  console.log("  앨리스가 밥에게 1 BTC를 보내는 거래:");
  console.log(`    1. 앨리스의 개인키: ${privateKey}`);
  console.log(`    2. 거래 데이터 해시: ${messageHash}`);
  console.log(`    3. 서명 생성: (r=${signature.r}, s=${signature.s})`);
  console.log(`    4. 네트워크에 전파: {거래, 서명, 공개키}`);
  console.log(`    5. 채굴자가 검증: 서명 유효? ${isValid ? "→ 블록에 포함!" : "→ 거부!"}`);
  console.log();
  console.log("  핵심: 앨리스는 개인키를 공개하지 않고도 거래의 소유권을 증명!");
}

demo();

export {
  type Point,
  type CurvePoint,
  type KeyPair,
  type Signature,
  modInverse,
  mod,
  isOnCurve,
  pointAdd,
  scalarMultiply,
  generateKeyPair,
  sign,
  verify,
  CURVE,
  G,
  N,
};
