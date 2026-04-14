// ============================================
// 활성화 함수 (Activation Functions)
// ============================================
// 신경망에 "비선형성"을 부여하는 함수.
// 없으면? 아무리 레이어를 쌓아도 결국 하나의 선형 변환 (W₃W₂W₁x = Wx).
// 있으면? 임의의 복잡한 함수를 근사할 수 있다 (만능 근사 정리).

// --- ReLU (Rectified Linear Unit) ---
// 현대 신경망에서 가장 많이 쓰이는 활성화 함수.
// f(x) = max(0, x)
// 장점: 계산이 간단, 기울기 소실 문제 완화
// 단점: x < 0이면 기울기가 0 ("dying ReLU")
function relu(x: number): number {
  return Math.max(0, x);
}

// ReLU 미분: x > 0이면 1 (그대로 통과), x ≤ 0이면 0 (차단)
// "Dying ReLU" 문제: 한번 음수 영역에 빠진 뉴런은 기울기가 0이라
// 영영 활성화되지 않을 수 있다. 해결책: Leaky ReLU (음수에 작은 기울기 0.01 부여)
function reluDerivative(x: number): number {
  return x > 0 ? 1 : 0;
}

// --- Sigmoid ---
// f(x) = 1 / (1 + e^(-x))
// 출력이 0~1 사이 → 확률로 해석 가능 (이진 분류의 출력층)
// 단점: 기울기 소실 (x가 크거나 작으면 기울기 ≈ 0)
function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

// sigmoid의 미분: σ'(x) = σ(x) × (1 - σ(x))
function sigmoidDerivative(x: number): number {
  const s = sigmoid(x);
  return s * (1 - s);
}

// --- Tanh ---
// f(x) = (e^x - e^(-x)) / (e^x + e^(-x))
// 출력이 -1~1 사이. Sigmoid보다 중심이 0이라 학습이 더 안정적.
// RNN, LSTM에서 자주 사용.
function tanh(x: number): number {
  return Math.tanh(x);
}

function tanhDerivative(x: number): number {
  const t = Math.tanh(x);
  return 1 - t * t;
}

// --- Softmax ---
// 벡터를 확률 분포로 변환. 모든 출력의 합 = 1.
// 다중 클래스 분류의 출력층에 사용.
//
// softmax(xᵢ) = e^xᵢ / Σ e^xⱼ
//
// 예) [2.0, 1.0, 0.1] → [0.659, 0.242, 0.099]
//     "클래스 0일 확률 65.9%, 클래스 1일 확률 24.2%, ..."
function softmax(x: number[]): number[] {
  // 수치 안정성: 최댓값을 빼서 오버플로 방지
  const max = Math.max(...x);
  const exps = x.map(v => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(v => v / sum);
}

// ============================================
// 손실 함수 (Loss Functions)
// ============================================
// "모델의 예측이 정답과 얼마나 다른가?"를 숫자 하나로 표현.
// 학습 = 이 숫자를 최소화하도록 가중치를 조정하는 것.

// --- MSE (Mean Squared Error) ---
// 회귀(regression) 문제에 사용.
// L = (1/n) Σ (예측 - 정답)²
function mse(predicted: number[], actual: number[]): number {
  const n = predicted.length;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const diff = predicted[i]! - actual[i]!;
    sum += diff * diff;
  }
  return sum / n;
}

// MSE의 미분: ∂L/∂ŷ = 2(ŷ - y) / n
function mseGradient(predicted: number[], actual: number[]): number[] {
  const n = predicted.length;
  return predicted.map((p, i) => (2 * (p - actual[i]!)) / n);
}

// --- Cross-Entropy Loss ---
// 분류(classification) 문제에 사용.
// L = -Σ yᵢ log(ŷᵢ)
//
// 정답이 [0, 1, 0]이고 예측이 [0.1, 0.8, 0.1]이면:
// L = -(0×log(0.1) + 1×log(0.8) + 0×log(0.1)) = -log(0.8) ≈ 0.223
//
// 예측이 정답에 가까울수록 손실이 작아지고 (→ 0),
// 완전히 틀리면 손실이 무한대로 발산 (log(0) → -∞).
function crossEntropy(predicted: number[], actual: number[]): number {
  let loss = 0;
  for (let i = 0; i < actual.length; i++) {
    if (actual[i]! > 0) {
      loss -= actual[i]! * Math.log(predicted[i]! + 1e-15); // 1e-15: log(0) 방지
    }
  }
  return loss;
}

// Softmax + Cross-Entropy의 결합 기울기 (놀랍도록 간단)
// ∂L/∂z = ŷ - y  (softmax 출력 - 원핫 정답)
function softmaxCrossEntropyGradient(predicted: number[], actual: number[]): number[] {
  return predicted.map((p, i) => p - actual[i]!);
}

export {
  relu, reluDerivative,
  sigmoid, sigmoidDerivative,
  tanh, tanhDerivative,
  softmax,
  mse, mseGradient,
  crossEntropy, softmaxCrossEntropyGradient,
};
