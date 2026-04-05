class TreeNode<T> {
  value: T;
  children: TreeNode<T>[] = [];

  constructor(value: T) {
    this.value = value;
  }
}

class Tree<T> {
  root: TreeNode<T> | null = null;

  addChild(parent: TreeNode<T>, value: T): TreeNode<T> {
    const node = new TreeNode(value);
    parent.children.push(node);
    return node;
  }

  // 깊이 우선 탐색
  dfs(value: T): TreeNode<T> | null {
    if (!this.root) return null;

    const search = (node: TreeNode<T>): TreeNode<T> | null => {
      if (node.value === value) return node;
      for (const child of node.children) {
        const found = search(child);
        if (found) return found;
      }
      return null;
    };

    return search(this.root);
  }

  // 너비 우선 탐색
  bfs(value: T): TreeNode<T> | null {
    if (!this.root) return null;
    const queue: TreeNode<T>[] = [this.root];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.value === value) return current;
      queue.push(...current.children);
    }
    return null;
  }

  // 트리의 높이
  height(node: TreeNode<T> | null = this.root): number {
    if (!node) return 0;
    if (node.children.length === 0) return 1;
    return 1 + Math.max(...node.children.map((c) => this.height(c)));
  }
}

export { Tree, TreeNode };
