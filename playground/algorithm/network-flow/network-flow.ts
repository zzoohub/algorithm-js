// ============================================
// Network Flow — Max-Flow / Min-Cut
// ============================================
// "파이프 네트워크에서 수원(source)에서 배수구(sink)로
//  최대 얼마의 물을 흘릴 수 있는가?"
//
// 핵심 정리: Max-Flow = Min-Cut
// 최대 유량 = 네트워크를 둘로 자르는 최소 비용
//
// Ford-Fulkerson 방법:
// 1. 잔여 용량이 있는 경로(증가 경로, augmenting path)를 찾는다
// 2. 그 경로에 흘릴 수 있는 만큼 유량을 보낸다
// 3. 더 이상 경로가 없을 때까지 반복
//
// Edmonds-Karp: Ford-Fulkerson에서 BFS로 증가 경로를 찾는 변형 → O(VE²)

// ============================================
// 1. Edmonds-Karp 알고리즘 (BFS 기반 Ford-Fulkerson)
// ============================================
class FlowNetwork {
  private capacity: number[][]; // capacity[u][v] = u→v 용량
  private flow: number[][];     // flow[u][v] = u→v 현재 유량
  private V: number;

  constructor(vertices: number) {
    this.V = vertices;
    this.capacity = Array.from({ length: vertices }, () => new Array(vertices).fill(0));
    this.flow = Array.from({ length: vertices }, () => new Array(vertices).fill(0));
  }

  // 간선 추가 (용량 설정)
  addEdge(from: number, to: number, cap: number): void {
    this.capacity[from]![to]! += cap;
  }

  // 최대 유량 계산 (Edmonds-Karp)
  maxFlow(source: number, sink: number): number {
    let totalFlow = 0;

    // BFS로 증가 경로를 찾을 수 있는 동안 반복
    while (true) {
      // BFS로 source → sink 경로 탐색 (잔여 용량 > 0인 간선만 사용)
      const parent = this.bfs(source, sink);
      if (!parent) break; // 더 이상 경로 없음 → 최대 유량 달성

      // 경로에서 보낼 수 있는 최대 유량 = 경로상 최소 잔여 용량 (병목)
      let pathFlow = Infinity;
      let v = sink;
      while (v !== source) {
        const u = parent[v]!;
        // 잔여 용량 = 원래 용량 - 현재 유량
        pathFlow = Math.min(pathFlow, this.capacity[u]![v]! - this.flow[u]![v]!);
        v = u;
      }

      // 경로를 따라 유량 갱신
      v = sink;
      while (v !== source) {
        const u = parent[v]!;
        this.flow[u]![v]! += pathFlow;  // 정방향: 유량 증가
        this.flow[v]![u]! -= pathFlow;  // 역방향: "유량 취소" 가능하게
        v = u;
      }

      totalFlow += pathFlow;
    }

    return totalFlow;
  }

  // BFS: 잔여 용량이 있는 경로를 찾아 parent 배열 반환
  private bfs(source: number, sink: number): number[] | null {
    const visited = new Set<number>();
    const parent = new Array(this.V).fill(-1);
    const queue: number[] = [source];
    visited.add(source);

    while (queue.length > 0) {
      const u = queue.shift()!;

      for (let v = 0; v < this.V; v++) {
        // 잔여 용량이 있고, 아직 방문하지 않은 노드
        if (!visited.has(v) && this.capacity[u]![v]! - this.flow[u]![v]! > 0) {
          visited.add(v);
          parent[v] = u;
          if (v === sink) return parent;
          queue.push(v);
        }
      }
    }

    return null; // sink에 도달 불가
  }

  // Min-Cut 찾기: maxFlow 실행 후, source에서 도달 가능한 정점 집합
  minCut(source: number, sink: number): {
    maxFlowValue: number;
    cutEdges: Array<{ from: number; to: number; capacity: number }>;
  } {
    const maxFlowValue = this.maxFlow(source, sink);

    // BFS로 source에서 잔여 용량을 통해 도달 가능한 정점 집합 (S)
    const reachable = new Set<number>();
    const queue = [source];
    reachable.add(source);

    while (queue.length > 0) {
      const u = queue.shift()!;
      for (let v = 0; v < this.V; v++) {
        if (!reachable.has(v) && this.capacity[u]![v]! - this.flow[u]![v]! > 0) {
          reachable.add(v);
          queue.push(v);
        }
      }
    }

    // S에서 T(=V\S)로 가는 간선이 min-cut
    const cutEdges: Array<{ from: number; to: number; capacity: number }> = [];
    for (const u of reachable) {
      for (let v = 0; v < this.V; v++) {
        if (!reachable.has(v) && this.capacity[u]![v]! > 0) {
          cutEdges.push({ from: u, to: v, capacity: this.capacity[u]![v]! });
        }
      }
    }

    return { maxFlowValue, cutEdges };
  }
}

// ============================================
// 2. 이분 매칭 (Bipartite Matching)
// ============================================
// Network Flow의 대표적 응용.
// "왼쪽 집합의 각 원소를 오른쪽 집합의 원소에 1:1로 매칭하되,
//  매칭 수를 최대화하라"
//
// 구현: 가상의 source/sink를 추가하고 max-flow를 구하면 최대 매칭.
//
//  S → a → 1 → T
//  S → b → 2 → T        (모든 간선 용량 = 1)
//  S → c → 3 → T
//
// 최대 유량 = 최대 매칭 수
function bipartiteMatching(
  left: number,   // 왼쪽 집합 크기
  right: number,  // 오른쪽 집합 크기
  edges: Array<[number, number]>  // [왼쪽 인덱스, 오른쪽 인덱스]
): {
  matchCount: number;
  matching: Array<[number, number]>;
} {
  // 노드: 0=source, 1..left=왼쪽, left+1..left+right=오른쪽, 마지막=sink
  const V = 1 + left + right + 1;
  const source = 0;
  const sink = V - 1;

  const network = new FlowNetwork(V);

  // source → 왼쪽 (용량 1)
  for (let i = 1; i <= left; i++) {
    network.addEdge(source, i, 1);
  }

  // 왼쪽 → 오른쪽 (간선, 용량 1)
  for (const [l, r] of edges) {
    network.addEdge(l + 1, left + r + 1, 1);
  }

  // 오른쪽 → sink (용량 1)
  for (let i = 1; i <= right; i++) {
    network.addEdge(left + i, sink, 1);
  }

  const matchCount = network.maxFlow(source, sink);

  // 매칭 복원은 생략 (flow 배열을 노출하면 가능)
  return { matchCount, matching: [] };
}

export { FlowNetwork, bipartiteMatching };
