class Node<T> {
  value: T;
  children: Node<T>[];

  constructor(value: T) {
    this.value = value;
    this.children = [];
  }
}

class Tree<T> {
  root: Node<T> | null;
  constructor() {
    this.root = null;
  }

  addChild(parent: Node<T>, value: T) {
    parent.children.push(new Node(value));
  }

  dfs(value: T) {
    if (!this.root) return null;

    function search(node: Node<T>): Node<T> | null {
      if (value === node.value) return node;
      for (const child of node.children) {
        const found = search(child);
        if (found) return found; // ✅ 찾으면 바로 반환
      }
      return null;
    }

    return search(this.root);
  }

  bfs(value: T) {
    if (!this.root) return null;

    function search(node: Node<T>): Node<T> | null {
      const queue = [node];
      while (queue.length > 0) {
        const current = queue.shift()!;
        if (current.value === value) {
          return current;
        }
        for (let child of current.children) {
          queue.push(child);
        }
      }

      return null;
    }

    return search(this.root);
  }
}
