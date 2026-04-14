// ============================================
// Floyd-Warshall 알고리즘 — 모든 쌍 최단 경로
// ============================================
// 그래프의 모든 정점 쌍 (i, j)에 대해 최단 거리를 한 번에 구한다.
// Dijkstra는 "한 출발점 → 나머지"인데, Floyd-Warshall은 "모든 → 모든".
//
// 핵심 DP 점화식:
//   dp[k][i][j] = "중간에 정점 0~k만 거쳐서 i에서 j로 가는 최단 거리"
//
//   dp[k][i][j] = min(
//     dp[k-1][i][j],           // k를 안 거침
//     dp[k-1][i][k] + dp[k-1][k][j]  // k를 거침
//   )
//
// 이 점화식의 아름다운 점:
// "경유할 수 있는 정점의 집합을 하나씩 늘려가며"
// 모든 경로를 점진적으로 개선한다.
//
// k=0: 직통 간선만 사용
// k=1: 정점 0을 경유 가능
// k=2: 정점 0, 1을 경유 가능
// ...
// k=V: 모든 정점을 경유 가능 = 최종 최단 거리

// 인접 행렬 입력: graph[i][j] = i→j 가중치 (없으면 Infinity)
// graph[i][i] = 0
function floydWarshall(graph: number[][]): {
  distances: number[][];
  next: (number | null)[][];    // 경로 복원용
  hasNegativeCycle: boolean;
} {
  const V = graph.length;

  // dist 배열 초기화 (원본 복사)
  const dist: number[][] = Array.from({ length: V }, (_, i) =>
    Array.from({ length: V }, (_, j) => graph[i]![j]!)
  );

  // next[i][j] = i에서 j로 가는 최단 경로에서 i 다음에 방문할 정점
  const next: (number | null)[][] = Array.from({ length: V }, (_, i) =>
    Array.from({ length: V }, (_, j) =>
      graph[i]![j] !== Infinity && i !== j ? j : null
    )
  );

  // 핵심: 3중 루프
  // k = 경유 가능한 정점 (가장 바깥)
  // i = 출발 정점
  // j = 도착 정점
  for (let k = 0; k < V; k++) {
    for (let i = 0; i < V; i++) {
      for (let j = 0; j < V; j++) {
        // i→k→j가 i→j보다 짧으면 갱신
        if (dist[i]![k]! + dist[k]![j]! < dist[i]![j]!) {
          dist[i]![j] = dist[i]![k]! + dist[k]![j]!;
          next[i]![j] = next[i]![k]!;  // i→j 경로의 다음 정점 = i→k 경로의 다음 정점
        }
      }
    }
  }

  // 음수 사이클 검출: dist[i][i] < 0인 정점이 있으면 음수 사이클 존재
  let hasNegativeCycle = false;
  for (let i = 0; i < V; i++) {
    if (dist[i]![i]! < 0) {
      hasNegativeCycle = true;
      break;
    }
  }

  return { distances: dist, next, hasNegativeCycle };
}

// 경로 복원: next 배열을 따라가며 실제 경로를 구한다
function reconstructPath(
  next: (number | null)[][],
  from: number,
  to: number
): number[] {
  if (next[from]![to] === null) return []; // 경로 없음

  const path = [from];
  let current = from;

  while (current !== to) {
    current = next[current]![to]!;
    if (current === null) return []; // 경로 끊김
    path.push(current);
  }

  return path;
}

// ============================================
// 편의 함수: 엣지 리스트 → 인접 행렬
// ============================================
function buildAdjMatrix(
  vertices: number,
  edges: Array<{ from: number; to: number; weight: number }>
): number[][] {
  const graph: number[][] = Array.from({ length: vertices }, (_, i) =>
    Array.from({ length: vertices }, (_, j) => (i === j ? 0 : Infinity))
  );

  for (const { from, to, weight } of edges) {
    graph[from]![to] = weight;
  }

  return graph;
}

export { floydWarshall, reconstructPath, buildAdjMatrix };
