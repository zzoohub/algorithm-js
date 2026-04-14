// ============================================
// K-Means 클러스터링 — 비지도 학습의 기초
// ============================================
// 라벨(정답) 없이 데이터를 K개의 그룹으로 자동 분류.
// "비슷한 것끼리 묶어라" → 유사도 기반 군집화.
//
// 알고리즘:
// 1. K개의 중심점(centroid)을 랜덤하게 초기화
// 2. 각 데이터를 가장 가까운 중심점에 할당 (assign)
// 3. 각 클러스터의 평균으로 중심점을 갱신 (update)
// 4. 중심점이 변하지 않을 때까지 2-3 반복
//
// 수렴 보장: 매 반복마다 총 거리가 줄거나 같으므로 반드시 수렴.

type Point = number[];

function kMeans(
  data: Point[],
  k: number,
  maxIterations = 100
): {
  centroids: Point[];
  assignments: number[];
  iterations: number;
} {
  const dim = data[0]!.length;

  // 1. 중심점 초기화 (K-Means++ 방식)
  let centroids = initCentroidsPlusPlus(data, k);

  let assignments = new Array(data.length).fill(0);
  let iterations = 0;

  for (let iter = 0; iter < maxIterations; iter++) {
    iterations++;

    // 2. 할당 단계: 각 점을 가장 가까운 중심에 배정
    const newAssignments = data.map(point =>
      findNearestCentroid(point, centroids)
    );

    // 수렴 체크: 할당이 변하지 않으면 종료
    if (newAssignments.every((a, i) => a === assignments[i])) break;
    assignments = newAssignments;

    // 3. 갱신 단계: 각 클러스터의 평균으로 중심점 이동
    const newCentroids: Point[] = Array.from({ length: k }, () =>
      new Array(dim).fill(0)
    );
    const counts = new Array(k).fill(0);

    for (let i = 0; i < data.length; i++) {
      const cluster = assignments[i]!;
      counts[cluster]++;
      for (let d = 0; d < dim; d++) {
        newCentroids[cluster]![d]! += data[i]![d]!;
      }
    }

    for (let c = 0; c < k; c++) {
      if (counts[c]! > 0) {
        for (let d = 0; d < dim; d++) {
          newCentroids[c]![d]! /= counts[c]!;
        }
      }
    }

    centroids = newCentroids;
  }

  return { centroids, assignments, iterations };
}

// --- 유클리드 거리 ---
function euclideanDist(a: Point, b: Point): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i]! - b[i]!;
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

// --- 가장 가까운 중심점 찾기 ---
function findNearestCentroid(point: Point, centroids: Point[]): number {
  let minDist = Infinity;
  let nearest = 0;
  for (let i = 0; i < centroids.length; i++) {
    const dist = euclideanDist(point, centroids[i]!);
    if (dist < minDist) {
      minDist = dist;
      nearest = i;
    }
  }
  return nearest;
}

// --- K-Means++ 초기화 ---
// 랜덤 초기화보다 훨씬 좋은 결과.
// 첫 중심은 랜덤, 이후 중심은 기존 중심과 멀리 떨어진 점을 높은 확률로 선택.
function initCentroidsPlusPlus(data: Point[], k: number): Point[] {
  const centroids: Point[] = [];

  // 첫 번째 중심: 랜덤
  centroids.push([...data[Math.floor(Math.random() * data.length)]!]);

  for (let c = 1; c < k; c++) {
    // K-Means++ 핵심: 거리²에 비례하는 확률로 다음 중심 선택
    // 예) 기존 중심과의 거리: [1, 10, 5]
    //     거리²:             [1, 100, 25]
    //     확률(정규화):       [0.8%, 79.4%, 19.8%]
    //     → 거리 10인 점이 79% 확률로 선택됨 → 자연스럽게 분산!

    // 각 점에서 가장 가까운 기존 중심까지의 거리²
    const distances = data.map(point => {
      const minDist = Math.min(...centroids.map(cent => euclideanDist(point, cent)));
      return minDist * minDist; // 거리² = 확률 가중치
    });

    // 거리²에 비례하는 확률로 다음 중심 선택
    const totalDist = distances.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalDist;
    for (let i = 0; i < data.length; i++) {
      random -= distances[i]!;
      if (random <= 0) {
        centroids.push([...data[i]!]);
        break;
      }
    }
  }

  return centroids;
}

export { kMeans, euclideanDist };
