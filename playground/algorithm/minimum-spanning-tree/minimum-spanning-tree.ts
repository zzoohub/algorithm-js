// ============================================
// Minimum Spanning Tree (최소 신장 트리)
// ============================================
// 그래프의 모든 정점을 연결하면서 간선 가중치의 합이 최소인 트리.
// V개의 정점을 V-1개의 간선으로 연결하되, 사이클 없이, 비용 최소.
//
// "10개의 도시를 도로로 연결하는데 건설 비용을 최소화하라"
//
// 두 가지 고전적 알고리즘:
// 1. Kruskal: 간선을 비용순으로 정렬, 사이클 안 만들면 추가 (Union-Find 활용)
// 2. Prim: 한 정점에서 시작, 가장 가까운 정점을 계속 추가 (Heap 활용)

interface Edge {
  from: number;
  to: number;
  weight: number;
}

// ============================================
// 1. Kruskal 알고리즘 — 간선 중심 (Greedy)
// ============================================
// 1) 모든 간선을 가중치 오름차순으로 정렬
// 2) 가장 가벼운 간선부터 꺼내서:
//    - 두 끝점이 다른 컴포넌트면 → 추가 (Union)
//    - 같은 컴포넌트면 → 건너뜀 (사이클 방지)
// 3) V-1개의 간선을 추가하면 종료
//
// Union-Find가 핵심 — 이미 구현한 자료구조의 대표적 활용 사례!

function kruskal(vertices: number, edges: Edge[]): {
  mstEdges: Edge[];
  totalWeight: number;
} {
  // 간선을 가중치 오름차순으로 정렬
  const sorted = [...edges].sort((a, b) => a.weight - b.weight);

  // Union-Find 초기화
  const parent = Array.from({ length: vertices }, (_, i) => i);
  const rank = new Array(vertices).fill(0);

  function find(x: number): number {
    if (parent[x] !== x) parent[x] = find(parent[x]!); // 경로 압축
    return parent[x]!;
  }

  function union(x: number, y: number): boolean {
    const rx = find(x), ry = find(y);
    if (rx === ry) return false; // 이미 같은 그룹
    if (rank[rx]! < rank[ry]!) parent[rx] = ry;
    else if (rank[rx]! > rank[ry]!) parent[ry] = rx;
    else { parent[ry] = rx; rank[rx]!++; }
    return true;
  }

  const mstEdges: Edge[] = [];
  let totalWeight = 0;

  for (const edge of sorted) {
    // 두 끝점이 다른 컴포넌트면 간선 추가
    if (union(edge.from, edge.to)) {
      mstEdges.push(edge);
      totalWeight += edge.weight;
      // V-1개 간선이면 완성
      if (mstEdges.length === vertices - 1) break;
    }
  }

  return { mstEdges, totalWeight };
}

// ============================================
// 2. Prim 알고리즘 — 정점 중심 (Greedy)
// ============================================
// 1) 임의의 시작 정점에서 출발
// 2) 현재 MST에 연결된 간선 중 가장 가벼운 것을 선택
// 3) 새 정점을 MST에 추가, 그 정점의 간선들을 후보에 추가
// 4) V-1개의 간선을 추가하면 종료
//
// Dijkstra와 매우 유사하지만, Dijkstra는 "출발점에서의 총 거리"를 기준으로,
// Prim은 "현재 트리까지의 연결 비용"을 기준으로 한다.

function prim(
  vertices: number,
  adjacency: Map<number, Array<{ to: number; weight: number }>>
): {
  mstEdges: Edge[];
  totalWeight: number;
} {
  const inMST = new Set<number>();
  const mstEdges: Edge[] = [];
  let totalWeight = 0;

  // 간단한 우선순위 큐 (실무에서는 Min Heap 사용)
  const pq: Array<{ from: number; to: number; weight: number }> = [];

  // 어떤 정점에서 시작해도 MST의 총 가중치는 같다.
  // (MST는 방향이 없으므로 시작점에 무관하게 최소 비용 보장)
  // 정점 0에서 시작
  inMST.add(0);
  for (const edge of adjacency.get(0) ?? []) {
    pq.push({ from: 0, to: edge.to, weight: edge.weight });
  }

  while (pq.length > 0 && mstEdges.length < vertices - 1) {
    // 가장 가벼운 간선 선택
    pq.sort((a, b) => a.weight - b.weight);
    const { from, to, weight } = pq.shift()!;

    if (inMST.has(to)) continue; // 이미 MST에 포함된 정점

    // MST에 추가
    inMST.add(to);
    mstEdges.push({ from, to, weight });
    totalWeight += weight;

    // 새 정점의 간선들을 후보에 추가
    for (const edge of adjacency.get(to) ?? []) {
      if (!inMST.has(edge.to)) {
        pq.push({ from: to, to: edge.to, weight: edge.weight });
      }
    }
  }

  return { mstEdges, totalWeight };
}

export { kruskal, prim };
export type { Edge };
