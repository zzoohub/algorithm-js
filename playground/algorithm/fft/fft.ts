// ============================================
// FFT (Fast Fourier Transform, 고속 푸리에 변환)
// ============================================
// O(n²)의 다항식 곱셈을 O(n log n)으로 줄이는 알고리즘.
// "20세기에 발견된 가장 중요한 알고리즘" 중 하나.
//
// 핵심 아이디어:
// 다항식을 "계수 표현" 대신 "점-값 표현"으로 바꾸면
// 곱셈이 O(n)에 된다. 문제는 변환 비용인데, FFT가 O(n log n)에 해준다.
//
//   계수 표현:   A(x) = 3 + 2x + x²         → 곱셈 O(n²)
//        ↓ FFT (O(n log n))
//   점-값 표현:  A(w₀)=6, A(w₁)=2-i, ...    → 곱셈 O(n)
//        ↓ IFFT (O(n log n))
//   결과 계수:   C(x) = ...
//
// 복소수(complex number)의 단위원(roots of unity) 위에서 평가하는 것이 핵심.
// n번째 단위근: wₙ = e^(2πi/n) = cos(2π/n) + i·sin(2π/n)

// ============================================
// 복소수 타입
// ============================================
type Complex = [number, number]; // [실수부, 허수부]

function cAdd(a: Complex, b: Complex): Complex {
  return [a[0] + b[0], a[1] + b[1]];
}

function cSub(a: Complex, b: Complex): Complex {
  return [a[0] - b[0], a[1] - b[1]];
}

function cMul(a: Complex, b: Complex): Complex {
  // (a+bi)(c+di) = (ac-bd) + (ad+bc)i
  return [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
}

// ============================================
// 1. FFT (Cooley-Tukey 알고리즘) — O(n log n)
// ============================================
// 분할정복:
// A(x)의 짝수 차수 계수 → A_even(x²)
// A(x)의 홀수 차수 계수 → A_odd(x²)
// A(x) = A_even(x²) + x · A_odd(x²)
//
// 단위근의 성질:
// wₙ^(n/2) = -1 (반바퀴 돌면 부호 반전)
// → A(wₙ^k)와 A(wₙ^(k+n/2))를 동시에 계산 가능 (Butterfly 연산)
function fft(coefficients: Complex[], inverse = false): Complex[] {
  const n = coefficients.length;
  if (n === 1) return [coefficients[0]!];

  // n이 2의 거듭제곱이어야 함
  const even: Complex[] = [];
  const odd: Complex[] = [];
  for (let i = 0; i < n; i++) {
    if (i % 2 === 0) even.push(coefficients[i]!);
    else odd.push(coefficients[i]!);
  }

  // 재귀적으로 절반씩 FFT
  const evenFFT = fft(even, inverse);
  const oddFFT = fft(odd, inverse);

  // n번째 단위근
  const angle = ((inverse ? -1 : 1) * 2 * Math.PI) / n;
  const result: Complex[] = new Array(n);

  for (let k = 0; k < n / 2; k++) {
    // w = e^(2πik/n) = cos(2πk/n) + i·sin(2πk/n)
    const w: Complex = [Math.cos(angle * k), Math.sin(angle * k)];

    // Butterfly 연산:
    // 단위원의 핵심 성질: w^(n/2) = -1 (반바퀴 돌면 부호 반전)
    // 이 성질 덕분에 k번째와 k+n/2번째를 한 번에 계산:
    //   result[k]       = even[k] + w · odd[k]
    //   result[k + n/2] = even[k] - w · odd[k]  ← 부호만 반전!
    const t = cMul(w, oddFFT[k]!);
    result[k] = cAdd(evenFFT[k]!, t);         // k번째
    result[k + n / 2] = cSub(evenFFT[k]!, t); // k+n/2번째 (부호 반전)
  }

  return result;
}

// IFFT: FFT의 역변환 (점-값 → 계수)
function ifft(values: Complex[]): Complex[] {
  const n = values.length;
  const result = fft(values, true);
  // IFFT는 FFT 결과를 n으로 나누면 됨
  return result.map(([re, im]) => [re / n, im / n]);
}

// ============================================
// 2. 다항식 곱셈 — O(n log n)
// ============================================
// A(x) × B(x)를 계수 배열로 반환
// 나이브: O(n²),  FFT: O(n log n)
function polyMultiply(a: number[], b: number[]): number[] {
  const resultLen = a.length + b.length - 1;

  // 2의 거듭제곱으로 패딩
  let n = 1;
  while (n < resultLen) n <<= 1;

  // 계수 → 복소수 배열 (허수부 = 0)
  const fa: Complex[] = Array.from({ length: n }, (_, i) => [a[i] ?? 0, 0]);
  const fb: Complex[] = Array.from({ length: n }, (_, i) => [b[i] ?? 0, 0]);

  // 계수 → 점-값 (FFT)
  const fftA = fft(fa);
  const fftB = fft(fb);

  // 점별 곱셈 (O(n))
  const fftC: Complex[] = new Array(n);
  for (let i = 0; i < n; i++) {
    fftC[i] = cMul(fftA[i]!, fftB[i]!);
  }

  // 점-값 → 계수 (IFFT)
  const result = ifft(fftC);

  // 실수부만 추출, 반올림
  return result.slice(0, resultLen).map(([re]) => Math.round(re));
}

// ============================================
// 3. 큰 수 곱셈 — FFT 응용
// ============================================
// 각 자릿수를 다항식의 계수로 보면 큰 수 곱셈 = 다항식 곱셈
// 123 × 456: [3,2,1] × [6,5,4] → [18,27,28,13,4] → carry 처리 → 56088
function bigIntMultiply(a: string, b: string): string {
  const digitsA = a.split("").reverse().map(Number);
  const digitsB = b.split("").reverse().map(Number);

  const product = polyMultiply(digitsA, digitsB);

  // Carry 처리
  const result: number[] = [];
  let carry = 0;
  for (let i = 0; i < product.length; i++) {
    const sum = product[i]! + carry;
    result.push(sum % 10);
    carry = Math.floor(sum / 10);
  }
  while (carry > 0) {
    result.push(carry % 10);
    carry = Math.floor(carry / 10);
  }

  // 앞의 0 제거 후 뒤집기
  while (result.length > 1 && result[result.length - 1] === 0) result.pop();
  return result.reverse().join("");
}

export { fft, ifft, polyMultiply, bigIntMultiply };
export type { Complex };
