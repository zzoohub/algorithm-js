class UnionFind {
  private parent: number[];
  private rank: number[];  // 트리 높이 (Union by Rank)
  private count: number;   // 그룹 수

  constructor(size: number) {
    this.parent = Array.from({ length: size }, (_, i) => i); // 자기 자신이 부모
    this.rank = new Array(size).fill(0);
    this.count = size;
  }

  // 루트를 찾으면서 경로 압축 (Path Compression)
  // 찾는 과정에서 만나는 모든 노드를 루트에 직접 연결한다
  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]!); // 경로 압축
    }
    return this.parent[x]!;
  }

  // 두 요소를 같은 그룹으로 합친다
  union(x: number, y: number): boolean {
    const rootX = this.find(x);
    const rootY = this.find(y);

    if (rootX === rootY) return false; // 이미 같은 그룹

    // Union by Rank: 낮은 트리를 높은 트리 아래에 붙인다
    if (this.rank[rootX]! < this.rank[rootY]!) {
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX]! > this.rank[rootY]!) {
      this.parent[rootY] = rootX;
    } else {
      this.parent[rootY] = rootX;
      this.rank[rootX]!++;
    }

    this.count--;
    return true;
  }

  // 같은 그룹인지 확인
  connected(x: number, y: number): boolean {
    return this.find(x) === this.find(y);
  }

  // 그룹 개수
  get groupCount(): number {
    return this.count;
  }
}

export { UnionFind };
