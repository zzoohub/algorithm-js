// ============================================
// SHA-256 (Secure Hash Algorithm 256-bit)
// ============================================
// 임의 길이의 입력을 고정 길이(256비트 = 32바이트 = 64자 hex)의 해시로 변환.
// 블록체인의 근간: 블록 해시, 주소 생성, 채굴(PoW) 모두 SHA-256.
//
// 핵심 성질:
// 1. 결정적: 같은 입력 → 항상 같은 출력
// 2. 빠른 계산: 입력이 얼마나 크든 빠르게 계산
// 3. 역상 저항성: 해시에서 원본을 역추적하는 것이 계산적으로 불가능
// 4. 충돌 저항성: 같은 해시를 만드는 두 다른 입력을 찾는 것이 사실상 불가능
// 5. 눈사태 효과: 입력이 1비트만 바뀌어도 출력의 약 50%가 변함
//
// 비트코인에서:
// - 블록 해시 = SHA256(SHA256(블록 헤더))
// - 주소 생성 = RIPEMD160(SHA256(공개키))
// - 채굴 = "해시 < 목표값"인 nonce 찾기

// ============================================
// SHA-256 알고리즘 요약 (코드를 읽기 전에 이해하기)
// ============================================
// 1. 전처리: 메시지에 패딩 추가 (512비트 배수로 맞춤)
// 2. 512비트 블록 단위로 반복:
//    a. 16개의 32비트 단어를 64개로 확장 (메시지 스케줄)
//    b. 8개의 작업 변수(a~h)를 64라운드 동안 뒤섞기 (압축)
//    c. 각 라운드: 시프트, XOR, AND, OR 등 비트 연산으로 "눈사태 효과" 생성
// 3. 최종 8개의 32비트 값을 이어붙이면 = 256비트 해시
//
// 아래 코드의 비트 연산이 복잡해 보이지만, 핵심은 "충분히 뒤섞기"다.
// 입력이 1비트만 바뀌어도 출력의 ~50%가 변하도록 설계되어 있다.

// 초기 해시값 (처음 8개 소수의 제곱근의 소수 부분)
const H0 = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
];

// 라운드 상수 (처음 64개 소수의 세제곱근의 소수 부분)
const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

// 비트 연산 유틸리티 (32비트 부호 없는 정수 연산)
function rotr(n: number, bits: number): number {
  return ((n >>> bits) | (n << (32 - bits))) >>> 0;
}

function ch(x: number, y: number, z: number): number {
  return ((x & y) ^ (~x & z)) >>> 0;
}

function maj(x: number, y: number, z: number): number {
  return ((x & y) ^ (x & z) ^ (y & z)) >>> 0;
}

function sigma0(x: number): number {
  return (rotr(x, 2) ^ rotr(x, 13) ^ rotr(x, 22)) >>> 0;
}

function sigma1(x: number): number {
  return (rotr(x, 6) ^ rotr(x, 11) ^ rotr(x, 25)) >>> 0;
}

function gamma0(x: number): number {
  return (rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3)) >>> 0;
}

function gamma1(x: number): number {
  return (rotr(x, 17) ^ rotr(x, 19) ^ (x >>> 10)) >>> 0;
}

// ============================================
// SHA-256 구현
// ============================================
function sha256(message: string): string {
  // 1. 전처리: 메시지를 바이트 배열로 변환
  const msgBytes = new TextEncoder().encode(message);
  const bitLength = msgBytes.length * 8;

  // 2. 패딩: 메시지 + 1비트(0x80) + 0패딩 + 64비트 길이
  // 총 길이가 512비트(64바이트)의 배수가 되도록
  const paddedLength = Math.ceil((msgBytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLength);
  padded.set(msgBytes);
  padded[msgBytes.length] = 0x80; // 1비트 추가

  // 마지막 8바이트에 원래 메시지의 비트 길이 (big-endian)
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLength - 4, bitLength, false);

  // 3. 해시 계산
  const hash = [...H0]; // 초기 해시값 복사

  // 512비트(64바이트) 블록 단위로 처리
  for (let offset = 0; offset < paddedLength; offset += 64) {
    // 메시지 스케줄 (16개의 32비트 워드 → 64개로 확장)
    const W = new Array(64).fill(0);
    for (let i = 0; i < 16; i++) {
      W[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      W[i] = (gamma1(W[i - 2]!) + W[i - 7]! + gamma0(W[i - 15]!) + W[i - 16]!) >>> 0;
    }

    // 작업 변수 초기화
    let [a, b, c, d, e, f, g, h] = hash;

    // 64라운드 압축
    for (let i = 0; i < 64; i++) {
      const T1 = (h! + sigma1(e!) + ch(e!, f!, g!) + K[i]! + W[i]!) >>> 0;
      const T2 = (sigma0(a!) + maj(a!, b!, c!)) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d! + T1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (T1 + T2) >>> 0;
    }

    // 해시값 업데이트
    hash[0] = (hash[0]! + a!) >>> 0;
    hash[1] = (hash[1]! + b!) >>> 0;
    hash[2] = (hash[2]! + c!) >>> 0;
    hash[3] = (hash[3]! + d!) >>> 0;
    hash[4] = (hash[4]! + e!) >>> 0;
    hash[5] = (hash[5]! + f!) >>> 0;
    hash[6] = (hash[6]! + g!) >>> 0;
    hash[7] = (hash[7]! + h!) >>> 0;
  }

  // 4. 최종 해시를 hex 문자열로 변환
  return hash.map(h => h.toString(16).padStart(8, "0")).join("");
}

export { sha256 };
