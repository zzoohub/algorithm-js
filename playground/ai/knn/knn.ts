// ============================================
// KNN (K-Nearest Neighbors) — 가장 직관적인 분류 알고리즘
// ============================================
// "주변에 가장 가까운 K개의 이웃을 보고, 다수결로 결정한다."
//
// 학습이 없다 (Lazy Learning):
// - 학습 단계: 데이터를 그냥 저장만 함
// - 예측 단계: 새 데이터와 모든 기존 데이터의 거리를 계산
//
// 장점: 매우 직관적, 구현 간단, 비선형 경계 가능
// 단점: 예측이 느림 O(n×d), 차원의 저주, 메모리 많이 필요

type Point = number[];

interface DataPoint {
  features: Point;
  label: string;
}

// ============================================
// 1. KNN 분류기 (Classifier)
// ============================================
class KNNClassifier {
  private data: DataPoint[];
  private k: number;

  constructor(k = 3) {
    this.k = k;
    this.data = [];
  }

  // "학습" = 데이터를 저장만 한다 (Lazy Learning)
  fit(data: DataPoint[]): void {
    this.data = data;
  }

  // 예측: K개의 가장 가까운 이웃의 다수결
  predict(query: Point): string {
    // 모든 데이터와의 거리 계산
    const distances = this.data.map(d => ({
      label: d.label,
      distance: this.euclidean(query, d.features),
    }));

    // 거리순 정렬 → 가장 가까운 K개 선택
    distances.sort((a, b) => a.distance - b.distance);
    const neighbors = distances.slice(0, this.k);

    // 다수결 투표
    const votes = new Map<string, number>();
    for (const n of neighbors) {
      votes.set(n.label, (votes.get(n.label) ?? 0) + 1);
    }

    // 가장 많은 표를 받은 라벨 반환
    let maxVotes = 0;
    let result = "";
    for (const [label, count] of votes) {
      if (count > maxVotes) {
        maxVotes = count;
        result = label;
      }
    }

    return result;
  }

  // 거리 가중 예측: 가까운 이웃에 더 큰 가중치
  predictWeighted(query: Point): string {
    const distances = this.data.map(d => ({
      label: d.label,
      distance: this.euclidean(query, d.features),
    }));

    distances.sort((a, b) => a.distance - b.distance);
    const neighbors = distances.slice(0, this.k);

    // 거리의 역수를 가중치로 사용
    const votes = new Map<string, number>();
    for (const n of neighbors) {
      const weight = 1 / (n.distance + 1e-10);
      votes.set(n.label, (votes.get(n.label) ?? 0) + weight);
    }

    let maxWeight = 0;
    let result = "";
    for (const [label, weight] of votes) {
      if (weight > maxWeight) {
        maxWeight = weight;
        result = label;
      }
    }

    return result;
  }

  private euclidean(a: Point, b: Point): number {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      const diff = a[i]! - b[i]!;
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  }
}

// ============================================
// 2. KNN 회귀 (Regressor)
// ============================================
// 분류가 아닌 연속값 예측: K개 이웃의 평균값
class KNNRegressor {
  private data: Array<{ features: Point; value: number }> = [];
  private k: number;

  constructor(k = 3) {
    this.k = k;
  }

  fit(data: Array<{ features: Point; value: number }>): void {
    this.data = data;
  }

  predict(query: Point): number {
    const distances = this.data.map(d => ({
      value: d.value,
      distance: this.euclidean(query, d.features),
    }));

    distances.sort((a, b) => a.distance - b.distance);
    const neighbors = distances.slice(0, this.k);

    // K개 이웃의 평균
    return neighbors.reduce((sum, n) => sum + n.value, 0) / neighbors.length;
  }

  private euclidean(a: Point, b: Point): number {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += (a[i]! - b[i]!) ** 2;
    }
    return Math.sqrt(sum);
  }
}

export { KNNClassifier, KNNRegressor };
export type { DataPoint };
