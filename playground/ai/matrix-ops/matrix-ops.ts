// ============================================
// 행렬 연산 — 신경망의 모든 계산의 기반
// ============================================
// 신경망의 순전파(forward pass)는 결국 행렬 곱셈 + 활성화 함수의 반복.
// y = f(Wx + b)
//
// W: 가중치 행렬 (weight matrix)
// x: 입력 벡터
// b: 편향 벡터 (bias)
// f: 활성화 함수
//
// GPU가 빠른 이유: 행렬 곱셈은 대량 병렬 연산이고, GPU는 그걸 잘한다.
// 이 파일에서는 CPU에서 직접 구현해서 원리를 이해한다.

type Matrix = number[][];
type Vector = number[];

// ============================================
// 1. 기본 행렬 연산
// ============================================

// 행렬 생성 (rows × cols, 초기값 0)
function zeros(rows: number, cols: number): Matrix {
  return Array.from({ length: rows }, () => new Array(cols).fill(0));
}

// 랜덤 행렬 (가우시안 분포 근사, Xavier 초기화에 사용)
function randn(rows: number, cols: number, scale = 1): Matrix {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => {
      // Box-Muller 변환: 균등 분포 → 정규 분포
      const u1 = Math.random();
      const u2 = Math.random();
      return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) * scale;
    })
  );
}

// 행렬 형상 (shape)
function shape(m: Matrix): [number, number] {
  return [m.length, m[0]?.length ?? 0];
}

// ============================================
// 2. 행렬 곱셈 (Matrix Multiplication) — 신경망의 핵심 연산
// ============================================
// C = A × B
// A: (m × n), B: (n × p) → C: (m × p)
//
// C[i][j] = Σ A[i][k] * B[k][j]  (k = 0..n-1)
//
// 신경망에서: output = W × input
// 각 뉴런의 출력 = 입력들의 가중합
function matMul(a: Matrix, b: Matrix): Matrix {
  const [m, n] = shape(a);
  const [n2, p] = shape(b);

  if (n !== n2) throw new Error(`행렬 크기 불일치: (${m}×${n}) × (${n2}×${p})`);

  const result = zeros(m, p);
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < p; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += a[i]![k]! * b[k]![j]!;
      }
      result[i]![j] = sum;
    }
  }
  return result;
}

// ============================================
// 3. 벡터 내적 (Dot Product) — 유사도 측정의 기본
// ============================================
// a · b = Σ a[i] * b[i]
//
// 코사인 유사도, 어텐션 스코어의 기본 연산.
// 두 벡터가 같은 방향이면 양수, 직교하면 0, 반대면 음수.
function dot(a: Vector, b: Vector): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i]! * b[i]!;
  }
  return sum;
}

// ============================================
// 4. 전치 (Transpose) — 행과 열을 뒤집기
// ============================================
// A^T[j][i] = A[i][j]
// 역전파에서 기울기를 전달할 때 가중치의 전치를 사용한다.
function transpose(m: Matrix): Matrix {
  const [rows, cols] = shape(m);
  const result = zeros(cols, rows);
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j]![i] = m[i]![j]!;
    }
  }
  return result;
}

// ============================================
// 5. 원소별 연산 (Element-wise Operations)
// ============================================
// 행렬의 같은 위치끼리 연산. 활성화 함수 적용, 기울기 계산에 사용.

function add(a: Matrix, b: Matrix): Matrix {
  const [rows, cols] = shape(a);
  return Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) => a[i]![j]! + b[i]![j]!)
  );
}

function subtract(a: Matrix, b: Matrix): Matrix {
  const [rows, cols] = shape(a);
  return Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) => a[i]![j]! - b[i]![j]!)
  );
}

function multiply(a: Matrix, b: Matrix): Matrix {
  const [rows, cols] = shape(a);
  return Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) => a[i]![j]! * b[i]![j]!)
  );
}

// 스칼라 곱
function scale(m: Matrix, scalar: number): Matrix {
  return m.map(row => row.map(v => v * scalar));
}

// ============================================
// 6. 브로드캐스팅 (Broadcasting) — 편향(bias) 더하기
// ============================================
// 행렬(m×n)에 벡터(1×n)를 더할 때, 벡터를 각 행에 반복 적용.
// y = Wx + b  ← 여기서 b를 각 샘플에 더하는 것이 브로드캐스팅.
function addBias(m: Matrix, bias: Vector): Matrix {
  return m.map(row => row.map((v, j) => v + bias[j]!));
}

// ============================================
// 7. 행렬 → 벡터 축소 (Reduction)
// ============================================
// 손실(loss) 계산, 정규화(normalization) 등에서 사용.

// 각 열의 합 (배치 평균 등에 사용)
function sumColumns(m: Matrix): Vector {
  const [rows, cols] = shape(m);
  const result = new Array(cols).fill(0);
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j] += m[i]![j]!;
    }
  }
  return result;
}

// 각 행의 합
function sumRows(m: Matrix): Vector {
  return m.map(row => row.reduce((sum, v) => sum + v, 0));
}

export {
  zeros, randn, shape,
  matMul, dot, transpose,
  add, subtract, multiply, scale,
  addBias, sumColumns, sumRows,
};
export type { Matrix, Vector };
