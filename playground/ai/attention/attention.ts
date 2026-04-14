// ============================================
// Attention Mechanism (어텐션 메커니즘)
// ============================================
// Transformer 아키텍처의 핵심. GPT, BERT, Claude 모두 이 위에 구축됨.
//
// 핵심 질문: "이 단어를 이해하려면 문장의 다른 어떤 단어에 주목해야 하는가?"
//
// "The cat sat on the mat because it was tired"
//  → "it"이 가리키는 대상은? → "cat"에 높은 어텐션
//
// 수학적으로:
//   Attention(Q, K, V) = softmax(QK^T / √d_k) × V
//
//   Q (Query):  "내가 찾고 싶은 것" — 현재 단어의 질문
//   K (Key):    "내가 가진 정보의 라벨" — 각 단어의 키
//   V (Value):  "실제 정보" — 각 단어의 값
//
//   내적(Q·K)이 높으면 → 관련성 높음 → 높은 가중치 → V를 많이 반영

type Matrix = number[][];

// ============================================
// 1. Scaled Dot-Product Attention
// ============================================
// 가장 기본적인 어텐션. Transformer의 빌딩 블록.
//
// 1) 유사도 계산: scores = Q × K^T
// 2) 스케일링: scores / √d_k  (값이 너무 커지면 softmax가 극단적이 됨)
// 3) Softmax: 가중치로 변환 (합=1)
// 4) 가중합: output = weights × V
function scaledDotProductAttention(
  Q: Matrix,  // (seq_len × d_k) — 각 위치의 쿼리
  K: Matrix,  // (seq_len × d_k) — 각 위치의 키
  V: Matrix   // (seq_len × d_v) — 각 위치의 값
): {
  output: Matrix;
  weights: Matrix;  // 어텐션 가중치 (시각화용)
} {
  const dk = K[0]!.length;
  const scale = Math.sqrt(dk);

  // 1) Q × K^T = 유사도 행렬 (seq_len × seq_len)
  const scores = matMul(Q, transpose(K));

  // 2) 스케일링
  const scaled = scores.map(row => row.map(v => v / scale));

  // 3) Softmax (각 행에 대해)
  const weights = scaled.map(row => softmax(row));

  // 4) weights × V = 가중합
  const output = matMul(weights, V);

  return { output, weights };
}

// ============================================
// 2. Self-Attention
// ============================================
// 입력 시퀀스가 자기 자신에게 어텐션을 수행.
// 같은 입력 X에서 Q, K, V를 생성.
//
// Q = X × W_Q
// K = X × W_K
// V = X × W_V
function selfAttention(
  X: Matrix,     // (seq_len × d_model) — 입력 임베딩
  Wq: Matrix,    // (d_model × d_k) — 쿼리 가중치
  Wk: Matrix,    // (d_model × d_k) — 키 가중치
  Wv: Matrix     // (d_model × d_v) — 값 가중치
): {
  output: Matrix;
  weights: Matrix;
} {
  const Q = matMul(X, Wq);
  const K = matMul(X, Wk);
  const V = matMul(X, Wv);

  return scaledDotProductAttention(Q, K, V);
}

// ============================================
// 3. Multi-Head Attention
// ============================================
// "여러 관점에서 동시에 어텐션을 수행한다."
//
// Head 1: 문법적 관계에 주목 ("주어-동사")
// Head 2: 의미적 관계에 주목 ("대명사-선행사")
// Head 3: 위치 관계에 주목 ("인접 단어")
//
// 각 헤드의 결과를 이어붙인(concat) 후 최종 변환.
function multiHeadAttention(
  X: Matrix,
  numHeads: number,
  dModel: number,
  dK: number,
  dV: number,
  // 각 헤드의 가중치들
  Wqs: Matrix[],
  Wks: Matrix[],
  Wvs: Matrix[],
  Wo: Matrix     // 출력 변환 (numHeads * dV × dModel)
): Matrix {
  const headOutputs: Matrix[] = [];

  // 각 헤드에서 독립적으로 어텐션 수행
  for (let h = 0; h < numHeads; h++) {
    const { output } = selfAttention(X, Wqs[h]!, Wks[h]!, Wvs[h]!);
    headOutputs.push(output);
  }

  // Concat: 모든 헤드의 출력을 이어붙이기
  const seqLen = X.length;
  const concat: Matrix = Array.from({ length: seqLen }, (_, i) =>
    headOutputs.flatMap(head => head[i]!)
  );

  // 최종 선형 변환
  return matMul(concat, Wo);
}

// ============================================
// 유틸리티
// ============================================
function matMul(a: Matrix, b: Matrix): Matrix {
  const m = a.length, n = b[0]!.length, k = b.length;
  const result: Matrix = Array.from({ length: m }, () => new Array(n).fill(0));
  for (let i = 0; i < m; i++)
    for (let j = 0; j < n; j++)
      for (let p = 0; p < k; p++)
        result[i]![j]! += a[i]![p]! * b[p]![j]!;
  return result;
}

function transpose(m: Matrix): Matrix {
  const rows = m.length, cols = m[0]!.length;
  return Array.from({ length: cols }, (_, j) =>
    Array.from({ length: rows }, (_, i) => m[i]![j]!)
  );
}

function softmax(x: number[]): number[] {
  const max = Math.max(...x);
  const exps = x.map(v => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(v => v / sum);
}

export { scaledDotProductAttention, selfAttention, multiHeadAttention };
