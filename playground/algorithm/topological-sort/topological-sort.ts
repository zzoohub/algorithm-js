type DAG = Map<string, string[]>;

// ============================================
// Kahn's Algorithm (BFS 기반 위상 정렬)
// ============================================
function topologicalSortKahn(graph: DAG): string[] | null {
  // 진입 차수(in-degree) 계산
  const inDegree = new Map<string, number>();
  for (const vertex of graph.keys()) inDegree.set(vertex, 0);
  for (const [, neighbors] of graph) {
    for (const neighbor of neighbors) {
      inDegree.set(neighbor, (inDegree.get(neighbor) ?? 0) + 1);
    }
  }

  // 진입 차수가 0인 정점을 큐에 넣는다
  const queue: string[] = [];
  for (const [vertex, degree] of inDegree) {
    if (degree === 0) queue.push(vertex);
  }

  const result: string[] = [];
  while (queue.length > 0) {
    const vertex = queue.shift()!;
    result.push(vertex);

    for (const neighbor of graph.get(vertex) ?? []) {
      const newDegree = inDegree.get(neighbor)! - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) queue.push(neighbor);
    }
  }

  // 모든 정점을 방문하지 못했으면 사이클 존재
  if (result.length !== graph.size) return null;
  return result;
}

// ============================================
// DFS 기반 위상 정렬
// ============================================
function topologicalSortDFS(graph: DAG): string[] | null {
  const visited = new Set<string>();
  const inStack = new Set<string>(); // 사이클 감지용
  const result: string[] = [];
  let hasCycle = false;

  function dfs(vertex: string) {
    if (hasCycle) return;
    visited.add(vertex);
    inStack.add(vertex);

    for (const neighbor of graph.get(vertex) ?? []) {
      if (inStack.has(neighbor)) {
        hasCycle = true;
        return;
      }
      if (!visited.has(neighbor)) dfs(neighbor);
    }

    inStack.delete(vertex);
    result.push(vertex); // 후위 순서로 추가
  }

  for (const vertex of graph.keys()) {
    if (!visited.has(vertex)) dfs(vertex);
  }

  if (hasCycle) return null;
  return result.reverse(); // 후위 순서를 뒤집으면 위상 순서
}

export { topologicalSortKahn, topologicalSortDFS };
