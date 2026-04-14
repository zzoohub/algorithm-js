// ============================================
// A* Search 알고리즘 — 최적 경로 탐색
// ============================================
// Dijkstra의 일반화. "목적지 방향의 정보(휴리스틱)"를 활용해서
// 불필요한 탐색을 줄이면서도 최단 경로를 보장한다.
//
// 핵심 공식:
//   f(n) = g(n) + h(n)
//
//   g(n): 시작점 → n까지의 실제 비용 (Dijkstra와 동일)
//   h(n): n → 목적지까지의 추정 비용 (휴리스틱)
//   f(n): 총 추정 비용 (이 값이 가장 작은 노드를 먼저 탐색)
//
// Dijkstra: h(n) = 0 (정보 없음, 모든 방향으로 탐색)
// A*:       h(n) > 0 (목적지 방향을 "힌트"로 줌)
//
//   Dijkstra의 탐색:           A*의 탐색:
//   ●●●●●                    ●●
//   ●●●S●●●●                 ●S●●
//   ●●●●●●●●●                 ●●●●
//   ●●●●●●●●●●●G              ●●●●G
//   ●●●●●●●●●                  ●●
//   ●●●●●                    ← 목적지 방향만 집중!

interface GridNode {
  row: number;
  col: number;
}

interface AStarResult {
  path: GridNode[];
  cost: number;
  nodesExplored: number;
}

// ============================================
// 1. 그리드 기반 A* (게임/로보틱스에서 가장 흔한 형태)
// ============================================
// grid[r][c] = 0이면 통행 가능, 1이면 벽
function aStarGrid(
  grid: number[][],
  start: GridNode,
  goal: GridNode,
  heuristic: "manhattan" | "euclidean" = "manhattan"
): AStarResult | null {
  const rows = grid.length;
  const cols = grid[0]!.length;

  // 휴리스틱 함수 선택
  const h = heuristic === "manhattan"
    ? (a: GridNode) => Math.abs(a.row - goal.row) + Math.abs(a.col - goal.col)
    : (a: GridNode) => Math.sqrt((a.row - goal.row) ** 2 + (a.col - goal.col) ** 2);

  // 상하좌우 이동 (대각선 이동이 필요하면 8방향으로 확장)
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  const key = (n: GridNode) => `${n.row},${n.col}`;

  // g(n): 시작점에서 n까지의 실제 비용
  const gScore = new Map<string, number>();
  gScore.set(key(start), 0);

  // f(n) = g(n) + h(n)
  const fScore = new Map<string, number>();
  fScore.set(key(start), h(start));

  // 경로 추적용
  const cameFrom = new Map<string, GridNode>();

  // Open set (방문 대기)
  const openSet: GridNode[] = [start];
  const inOpen = new Set<string>([key(start)]);

  // Closed set (방문 완료)
  const closed = new Set<string>();

  let nodesExplored = 0;

  while (openSet.length > 0) {
    // f(n)이 가장 작은 노드를 선택 (Min Heap이면 O(log n))
    openSet.sort((a, b) => (fScore.get(key(a)) ?? Infinity) - (fScore.get(key(b)) ?? Infinity));
    const current = openSet.shift()!;
    const currentKey = key(current);
    inOpen.delete(currentKey);
    nodesExplored++;

    // 목적지 도달!
    if (current.row === goal.row && current.col === goal.col) {
      return {
        path: reconstructPath(cameFrom, current),
        cost: gScore.get(currentKey)!,
        nodesExplored,
      };
    }

    closed.add(currentKey);

    // 이웃 탐색
    for (const [dr, dc] of directions) {
      const neighbor: GridNode = { row: current.row + dr!, col: current.col + dc! };
      const nKey = key(neighbor);

      // 범위 체크 + 벽 체크 + 이미 방문 체크
      if (
        neighbor.row < 0 || neighbor.row >= rows ||
        neighbor.col < 0 || neighbor.col >= cols ||
        grid[neighbor.row]![neighbor.col] === 1 ||
        closed.has(nKey)
      ) continue;

      // 이 경로가 더 좋은가?
      const tentativeG = gScore.get(currentKey)! + 1; // 이동 비용 1

      if (tentativeG < (gScore.get(nKey) ?? Infinity)) {
        // 더 좋은 경로 발견!
        cameFrom.set(nKey, current);
        gScore.set(nKey, tentativeG);
        fScore.set(nKey, tentativeG + h(neighbor));

        if (!inOpen.has(nKey)) {
          openSet.push(neighbor);
          inOpen.add(nKey);
        }
      }
    }
  }

  return null; // 경로 없음
}

function reconstructPath(
  cameFrom: Map<string, GridNode>,
  current: GridNode
): GridNode[] {
  const path = [current];
  let key = `${current.row},${current.col}`;

  while (cameFrom.has(key)) {
    const prev = cameFrom.get(key)!;
    path.unshift(prev);
    key = `${prev.row},${prev.col}`;
  }

  return path;
}

// ============================================
// 2. 일반 그래프 A* (임의의 가중 그래프)
// ============================================
function aStarGraph(
  neighbors: Map<string, Array<{ node: string; cost: number }>>,
  start: string,
  goal: string,
  heuristic: (node: string) => number  // 사용자 정의 휴리스틱
): { path: string[]; cost: number } | null {
  const gScore = new Map<string, number>();
  gScore.set(start, 0);

  const fScore = new Map<string, number>();
  fScore.set(start, heuristic(start));

  const cameFrom = new Map<string, string>();
  const openSet: string[] = [start];
  const closed = new Set<string>();

  while (openSet.length > 0) {
    openSet.sort((a, b) => (fScore.get(a) ?? Infinity) - (fScore.get(b) ?? Infinity));
    const current = openSet.shift()!;

    if (current === goal) {
      const path: string[] = [current];
      let node = current;
      while (cameFrom.has(node)) {
        node = cameFrom.get(node)!;
        path.unshift(node);
      }
      return { path, cost: gScore.get(current)! };
    }

    closed.add(current);

    for (const { node: neighbor, cost } of neighbors.get(current) ?? []) {
      if (closed.has(neighbor)) continue;

      const tentativeG = gScore.get(current)! + cost;
      if (tentativeG < (gScore.get(neighbor) ?? Infinity)) {
        cameFrom.set(neighbor, current);
        gScore.set(neighbor, tentativeG);
        fScore.set(neighbor, tentativeG + heuristic(neighbor));

        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }

  return null;
}

export { aStarGrid, aStarGraph };
export type { GridNode, AStarResult };
