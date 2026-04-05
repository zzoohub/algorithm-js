type WeightedGraph = Map<string, Array<{ node: string; weight: number }>>;

// ============================================
// Dijkstra 알고리즘 — Min Heap 사용
// ============================================
function dijkstra(
  graph: WeightedGraph,
  start: string
): { distances: Map<string, number>; previous: Map<string, string | null> } {
  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const visited = new Set<string>();

  // 간단한 우선순위 큐 (실제로는 Min Heap이 효율적)
  const pq: Array<{ node: string; dist: number }> = [];

  // 초기화
  for (const vertex of graph.keys()) {
    distances.set(vertex, vertex === start ? 0 : Infinity);
    previous.set(vertex, null);
  }
  pq.push({ node: start, dist: 0 });

  while (pq.length > 0) {
    // 최소 거리 노드 추출 (Min Heap이면 O(log n))
    pq.sort((a, b) => a.dist - b.dist);
    const { node: current, dist: currentDist } = pq.shift()!;

    if (visited.has(current)) continue;
    visited.add(current);

    for (const { node: neighbor, weight } of graph.get(current) ?? []) {
      const newDist = currentDist + weight;
      if (newDist < distances.get(neighbor)!) {
        distances.set(neighbor, newDist);
        previous.set(neighbor, current);
        pq.push({ node: neighbor, dist: newDist });
      }
    }
  }

  return { distances, previous };
}

// 경로 복원
function getPath(previous: Map<string, string | null>, target: string): string[] {
  const path: string[] = [];
  let current: string | null = target;

  while (current !== null) {
    path.unshift(current);
    current = previous.get(current) ?? null;
  }

  return path;
}

// ============================================
// Bellman-Ford 알고리즘 — 음수 가중치 허용
// ============================================
function bellmanFord(
  vertices: string[],
  edges: Array<{ from: string; to: string; weight: number }>,
  start: string
): { distances: Map<string, number>; hasNegativeCycle: boolean } {
  const distances = new Map<string, number>();

  for (const v of vertices) distances.set(v, Infinity);
  distances.set(start, 0);

  // V-1번 반복: 모든 간선을 완화(relax)
  for (let i = 0; i < vertices.length - 1; i++) {
    for (const { from, to, weight } of edges) {
      const fromDist = distances.get(from)!;
      if (fromDist !== Infinity && fromDist + weight < distances.get(to)!) {
        distances.set(to, fromDist + weight);
      }
    }
  }

  // V번째 반복에서도 완화가 가능하면 음수 사이클 존재
  let hasNegativeCycle = false;
  for (const { from, to, weight } of edges) {
    if (distances.get(from)! + weight < distances.get(to)!) {
      hasNegativeCycle = true;
      break;
    }
  }

  return { distances, hasNegativeCycle };
}

export { dijkstra, getPath, bellmanFord };
