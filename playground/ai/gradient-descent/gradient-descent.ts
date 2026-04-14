// ============================================
// 경사 하강법 (Gradient Descent)
// ============================================
// "산에서 가장 낮은 곳을 찾아 내려가는 것"
// 손실 함수의 기울기(gradient)를 구하고, 기울기의 반대 방향으로 이동.
//
// w_new = w_old - lr × ∂L/∂w
//
// lr (learning rate): 한 번에 얼마나 이동할지.
// - 너무 크면: 최적점을 지나쳐서 발산
// - 너무 작으면: 수렴이 너무 느림
// - 적절하면: 점점 최적점에 수렴
//
//   손실
//   │╲
//   │  ╲        ╱
//   │    ╲    ╱    ← lr이 너무 크면 왔다갔다
//   │      ╲╱
//   │     최적점
//   └──────────── w

type GradientFn = (params: number[]) => number[];
type LossFn = (params: number[]) => number;

// ============================================
// 1. Vanilla Gradient Descent (기본)
// ============================================
// 가장 단순한 형태. 기울기 × 학습률만큼 이동.
function gradientDescent(
  params: number[],
  gradientFn: GradientFn,
  lr: number,
  steps: number
): { params: number[]; history: number[] } {
  let current = [...params];
  const history: number[] = [];

  for (let step = 0; step < steps; step++) {
    const grads = gradientFn(current);
    // w = w - lr × gradient
    current = current.map((w, i) => w - lr * grads[i]!);
    history.push(grads.reduce((sum, g) => sum + g * g, 0)); // gradient norm
  }

  return { params: current, history };
}

// ============================================
// 2. SGD with Momentum (모멘텀)
// ============================================
// 기본 SGD의 문제: 기울기가 진동하면 수렴이 느림.
// 모멘텀: "관성"을 추가. 이전 이동 방향을 기억해서 가속.
//
// v = β × v_prev + (1 - β) × gradient   ← 이동 속도 (지수이동평균)
// w = w - lr × v
//
// 골짜기에서 공이 구르는 것처럼:
// 같은 방향이면 가속, 반대 방향이면 감속 (진동 억제)
function sgdMomentum(
  params: number[],
  gradientFn: GradientFn,
  lr: number,
  steps: number,
  beta = 0.9
): { params: number[]; history: number[] } {
  let current = [...params];
  let velocity = new Array(params.length).fill(0);
  const history: number[] = [];

  for (let step = 0; step < steps; step++) {
    const grads = gradientFn(current);

    // 속도 업데이트 (지수이동평균)
    velocity = velocity.map((v, i) => beta * v + (1 - beta) * grads[i]!);

    // 파라미터 업데이트
    current = current.map((w, i) => w - lr * velocity[i]!);
    history.push(grads.reduce((sum, g) => sum + g * g, 0));
  }

  return { params: current, history };
}

// ============================================
// 3. Adam (Adaptive Moment Estimation)
// ============================================
// 현대 딥러닝에서 가장 널리 쓰이는 옵티마이저.
// Momentum + RMSProp의 결합.
//
// 핵심: 파라미터마다 학습률을 자동 조정한다.
// - 기울기가 큰 파라미터 → 학습률 줄임 (오버슈팅 방지)
// - 기울기가 작은 파라미터 → 학습률 키움 (느린 학습 가속)
//
// m = β₁ × m + (1-β₁) × g        ← 1차 모멘트 (평균 기울기)
// v = β₂ × v + (1-β₂) × g²       ← 2차 모멘트 (기울기 분산)
// m̂ = m / (1 - β₁^t)             ← 편향 보정
// v̂ = v / (1 - β₂^t)
// w = w - lr × m̂ / (√v̂ + ε)
function adam(
  params: number[],
  gradientFn: GradientFn,
  lr = 0.001,
  steps = 1000,
  beta1 = 0.9,
  beta2 = 0.999,
  epsilon = 1e-8
): { params: number[]; history: number[] } {
  let current = [...params];
  let m = new Array(params.length).fill(0);  // 1차 모멘트
  let v = new Array(params.length).fill(0);  // 2차 모멘트
  const history: number[] = [];

  for (let t = 1; t <= steps; t++) {
    const grads = gradientFn(current);

    // 모멘트 업데이트
    m = m.map((mi, i) => beta1 * mi + (1 - beta1) * grads[i]!);
    v = v.map((vi, i) => beta2 * vi + (1 - beta2) * grads[i]! * grads[i]!);

    // 편향 보정 (초기 단계에서 0으로 편향된 것을 보정)
    const mHat = m.map(mi => mi / (1 - Math.pow(beta1, t)));
    const vHat = v.map(vi => vi / (1 - Math.pow(beta2, t)));

    // 파라미터 업데이트
    current = current.map((w, i) => w - lr * mHat[i]! / (Math.sqrt(vHat[i]!) + epsilon));
    history.push(grads.reduce((sum, g) => sum + g * g, 0));
  }

  return { params: current, history };
}

// ============================================
// 예제: 간단한 2차 함수 최적화
// ============================================
// f(x, y) = (x - 3)² + (y + 1)²
// 최적점: (3, -1), 최솟값: 0
function exampleOptimization() {
  const gradientFn: GradientFn = ([x, y]) => [
    2 * (x! - 3),  // ∂f/∂x
    2 * (y! + 1),  // ∂f/∂y
  ];

  const start = [0, 0];

  const vanilla = gradientDescent(start, gradientFn, 0.1, 50);
  const momentum = sgdMomentum(start, gradientFn, 0.1, 50);
  const adamResult = adam(start, gradientFn, 0.1, 50);

  return { vanilla, momentum, adam: adamResult };
}

export { gradientDescent, sgdMomentum, adam, exampleOptimization };
