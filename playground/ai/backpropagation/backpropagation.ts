// ============================================
// 역전파 (Backpropagation)
// ============================================
// 신경망 학습의 핵심: "손실을 각 가중치가 얼마나 책임지는가?"를 계산.
// 미적분의 연쇄 법칙(chain rule)을 계산 그래프에 적용한 것.
//
// 순전파 (Forward): 입력 → 예측
// 역전파 (Backward): 손실 → 각 가중치의 기울기
//
// 이 파일에서는 2층 신경망을 직접 구현하여
// 순전파 → 손실 계산 → 역전파 → 가중치 갱신의 전체 과정을 보여준다.
//
// 구조: 입력(2) → 은닉층(4, ReLU) → 출력(1, Sigmoid) → 손실(BCE)

// ============================================
// 미니 신경망 — 직접 구현
// ============================================
class SimpleNeuralNetwork {
  // 가중치와 편향
  W1: number[][]; // (inputSize × hiddenSize)
  b1: number[];   // (hiddenSize)
  W2: number[][]; // (hiddenSize × outputSize)
  b2: number[];   // (outputSize)

  // 순전파 중간값 (역전파에서 사용)
  private x!: number[];        // 입력
  private z1!: number[];       // W1*x + b1 (활성화 전)
  private a1!: number[];       // ReLU(z1) (활성화 후)
  private z2!: number[];       // W2*a1 + b2
  private a2!: number[];       // Sigmoid(z2) = 최종 출력

  constructor(inputSize: number, hiddenSize: number, outputSize: number) {
    // Xavier 초기화
    const scale1 = Math.sqrt(2 / inputSize);
    const scale2 = Math.sqrt(2 / hiddenSize);

    this.W1 = this.randomMatrix(inputSize, hiddenSize, scale1);
    this.b1 = new Array(hiddenSize).fill(0);
    this.W2 = this.randomMatrix(hiddenSize, outputSize, scale2);
    this.b2 = new Array(outputSize).fill(0);
  }

  // --- 순전파 (Forward Pass) ---
  // 입력 → 예측값
  forward(x: number[]): number[] {
    this.x = x;

    // 레이어 1: z1 = W1^T * x + b1, a1 = ReLU(z1)
    this.z1 = this.linear(x, this.W1, this.b1);
    this.a1 = this.z1.map(v => Math.max(0, v)); // ReLU

    // 레이어 2: z2 = W2^T * a1 + b2, a2 = Sigmoid(z2)
    this.z2 = this.linear(this.a1, this.W2, this.b2);
    this.a2 = this.z2.map(v => 1 / (1 + Math.exp(-v))); // Sigmoid

    return this.a2;
  }

  // --- 역전파 (Backward Pass) ---
  // 손실에서 시작해서 각 가중치의 기울기를 계산
  //
  // 연쇄 법칙 (Chain Rule):
  // ∂L/∂W1 = ∂L/∂a2 × ∂a2/∂z2 × ∂z2/∂a1 × ∂a1/∂z1 × ∂z1/∂W1
  //
  // 역방향으로 흘러가면서 각 레이어의 기울기를 곱해나간다.
  backward(target: number[], lr: number): number {
    const m = 1; // 단일 샘플

    // --- 손실 계산 (Binary Cross-Entropy) ---
    const loss = target.reduce((sum, t, i) => {
      const p = this.a2[i]!;
      return sum - (t * Math.log(p + 1e-15) + (1 - t) * Math.log(1 - p + 1e-15));
    }, 0);

    // --- 출력층 기울기 ---
    // ∂L/∂z2 = a2 - target (Sigmoid + BCE의 결합 기울기)
    const dz2 = this.a2.map((a, i) => a - target[i]!);

    // ∂L/∂W2 = a1^T × dz2
    const dW2 = this.outerProduct(this.a1, dz2);
    // ∂L/∂b2 = dz2
    const db2 = dz2;

    // --- 은닉층 기울기 ---
    // ∂L/∂a1 = W2 × dz2  (기울기를 역방향으로 전달)
    const da1 = this.W2.map(row =>
      row.reduce((sum, w, j) => sum + w * dz2[j]!, 0)
    );

    // ∂L/∂z1 = da1 × ReLU'(z1)
    // ReLU'(z) = z > 0 ? 1 : 0
    const dz1 = da1.map((d, i) => d * (this.z1[i]! > 0 ? 1 : 0));

    // ∂L/∂W1 = x^T × dz1
    const dW1 = this.outerProduct(this.x, dz1);
    // ∂L/∂b1 = dz1
    const db1 = dz1;

    // --- 가중치 갱신 (Gradient Descent) ---
    this.updateWeights(this.W1, dW1, lr);
    this.b1 = this.b1.map((b, i) => b - lr * db1[i]!);
    this.updateWeights(this.W2, dW2, lr);
    this.b2 = this.b2.map((b, i) => b - lr * db2[i]!);

    return loss;
  }

  // --- 유틸리티 ---

  private linear(input: number[], W: number[][], b: number[]): number[] {
    return W[0]!.map((_, j) =>
      input.reduce((sum, x, i) => sum + x * W[i]![j]!, 0) + b[j]!
    );
  }

  private outerProduct(a: number[], b: number[]): number[][] {
    return a.map(ai => b.map(bj => ai * bj));
  }

  private updateWeights(W: number[][], dW: number[][], lr: number): void {
    for (let i = 0; i < W.length; i++) {
      for (let j = 0; j < W[i]!.length; j++) {
        W[i]![j]! -= lr * dW[i]![j]!;
      }
    }
  }

  private randomMatrix(rows: number, cols: number, scale: number): number[][] {
    return Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => (Math.random() * 2 - 1) * scale)
    );
  }
}

// ============================================
// XOR 학습 — 역전파의 고전적 데모
// ============================================
// XOR은 선형 분리가 불가능 → 은닉층이 필수 → 역전파가 핵심
function trainXOR() {
  const net = new SimpleNeuralNetwork(2, 4, 1);
  const data = [
    { input: [0, 0], target: [0] },
    { input: [0, 1], target: [1] },
    { input: [1, 0], target: [1] },
    { input: [1, 1], target: [0] },
  ];

  const losses: number[] = [];

  for (let epoch = 0; epoch < 1000; epoch++) {
    let epochLoss = 0;
    for (const { input, target } of data) {
      net.forward(input);
      epochLoss += net.backward(target, 0.1);
    }
    if (epoch % 100 === 0) losses.push(epochLoss / data.length);
  }

  // 학습 후 예측
  const predictions = data.map(d => ({
    input: d.input,
    predicted: net.forward(d.input)[0]!.toFixed(3),
    target: d.target[0],
  }));

  return { losses, predictions };
}

export { SimpleNeuralNetwork, trainXOR };
