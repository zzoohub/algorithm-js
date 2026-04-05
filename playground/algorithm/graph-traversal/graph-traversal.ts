type AdjList = Map<string, string[]>;

// ============================================
// BFS (너비 우선 탐색)
// ============================================
function bfs(graph: AdjList, start: string): string[] {
  const visited = new Set<string>([start]);
  const queue: string[] = [start];
  const result: string[] = [];

  while (queue.length > 0) {
    const vertex = queue.shift()!;
    result.push(vertex);

    for (const neighbor of graph.get(vertex) ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return result;
}

// ============================================
// DFS (깊이 우선 탐색) — 재귀
// ============================================
function dfsRecursive(graph: AdjList, start: string): string[] {
  const visited = new Set<string>();
  const result: string[] = [];

  function dfs(vertex: string) {
    visited.add(vertex);
    result.push(vertex);
    for (const neighbor of graph.get(vertex) ?? []) {
      if (!visited.has(neighbor)) {
        dfs(neighbor);
      }
    }
  }

  dfs(start);
  return result;
}

// ============================================
// DFS (깊이 우선 탐색) — 스택 (반복)
// ============================================
function dfsIterative(graph: AdjList, start: string): string[] {
  const visited = new Set<string>();
  const stack: string[] = [start];
  const result: string[] = [];

  while (stack.length > 0) {
    const vertex = stack.pop()!;
    if (visited.has(vertex)) continue;

    visited.add(vertex);
    result.push(vertex);

    // 역순으로 넣어야 원래 순서대로 방문
    const neighbors = graph.get(vertex) ?? [];
    for (let i = neighbors.length - 1; i >= 0; i--) {
      if (!visited.has(neighbors[i]!)) {
        stack.push(neighbors[i]!);
      }
    }
  }

  return result;
}

// ============================================
// 사이클 감지 (방향 그래프)
// ============================================
function hasCycle(graph: AdjList): boolean {
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map<string, number>();

  for (const vertex of graph.keys()) color.set(vertex, WHITE);

  function dfs(vertex: string): boolean {
    color.set(vertex, GRAY); // 현재 탐색 중

    for (const neighbor of graph.get(vertex) ?? []) {
      if (color.get(neighbor) === GRAY) return true;  // 현재 경로에서 다시 만남 = 사이클
      if (color.get(neighbor) === WHITE && dfs(neighbor)) return true;
    }

    color.set(vertex, BLACK); // 탐색 완료
    return false;
  }

  for (const vertex of graph.keys()) {
    if (color.get(vertex) === WHITE && dfs(vertex)) return true;
  }
  return false;
}

export { bfs, dfsRecursive, dfsIterative, hasCycle };
