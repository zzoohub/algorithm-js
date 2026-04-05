// 인접 리스트 기반 그래프 (방향/무방향, 가중치 지원)
class Graph<T> {
  private adjacencyList = new Map<T, Array<{ node: T; weight: number }>>();
  private directed: boolean;

  constructor(directed = false) {
    this.directed = directed;
  }

  addVertex(vertex: T): void {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, []);
    }
  }

  addEdge(from: T, to: T, weight = 1): void {
    this.addVertex(from);
    this.addVertex(to);
    this.adjacencyList.get(from)!.push({ node: to, weight });
    if (!this.directed) {
      this.adjacencyList.get(to)!.push({ node: from, weight });
    }
  }

  removeEdge(from: T, to: T): void {
    const neighbors = this.adjacencyList.get(from);
    if (neighbors) {
      this.adjacencyList.set(from, neighbors.filter((e) => e.node !== to));
    }
    if (!this.directed) {
      const reverseNeighbors = this.adjacencyList.get(to);
      if (reverseNeighbors) {
        this.adjacencyList.set(to, reverseNeighbors.filter((e) => e.node !== from));
      }
    }
  }

  removeVertex(vertex: T): void {
    if (!this.adjacencyList.has(vertex)) return;
    // 다른 정점들의 인접 리스트에서도 제거
    for (const [, edges] of this.adjacencyList) {
      const idx = edges.findIndex((e) => e.node === vertex);
      if (idx !== -1) edges.splice(idx, 1);
    }
    this.adjacencyList.delete(vertex);
  }

  getNeighbors(vertex: T): Array<{ node: T; weight: number }> {
    return this.adjacencyList.get(vertex) ?? [];
  }

  getVertices(): T[] {
    return [...this.adjacencyList.keys()];
  }

  hasVertex(vertex: T): boolean {
    return this.adjacencyList.has(vertex);
  }

  hasEdge(from: T, to: T): boolean {
    return this.adjacencyList.get(from)?.some((e) => e.node === to) ?? false;
  }

  get vertexCount(): number {
    return this.adjacencyList.size;
  }
}

export { Graph };
