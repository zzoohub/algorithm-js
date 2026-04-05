class BSTNode {
  value: number;
  left: BSTNode | null = null;
  right: BSTNode | null = null;
  constructor(value: number) {
    this.value = value;
  }
}

class BST {
  root: BSTNode | null = null;

  insert(value: number): void {
    const node = new BSTNode(value);
    if (!this.root) {
      this.root = node;
      return;
    }
    let current = this.root;
    while (true) {
      if (value === current.value) return; // 중복 무시
      if (value < current.value) {
        if (!current.left) { current.left = node; return; }
        current = current.left;
      } else {
        if (!current.right) { current.right = node; return; }
        current = current.right;
      }
    }
  }

  search(value: number): BSTNode | null {
    let current = this.root;
    while (current) {
      if (value === current.value) return current;
      current = value < current.value ? current.left : current.right;
    }
    return null;
  }

  delete(value: number): void {
    this.root = this._delete(this.root, value);
  }

  private _delete(node: BSTNode | null, value: number): BSTNode | null {
    if (!node) return null;

    if (value < node.value) {
      node.left = this._delete(node.left, value);
    } else if (value > node.value) {
      node.right = this._delete(node.right, value);
    } else {
      // 삭제할 노드를 찾음
      if (!node.left) return node.right;
      if (!node.right) return node.left;
      // 자식이 둘 다 있으면: 오른쪽 서브트리의 최솟값으로 대체
      let successor = node.right;
      while (successor.left) successor = successor.left;
      node.value = successor.value;
      node.right = this._delete(node.right, successor.value);
    }
    return node;
  }

  // 중위 순회: 정렬된 순서로 출력
  inorder(node: BSTNode | null = this.root): number[] {
    if (!node) return [];
    return [...this.inorder(node.left), node.value, ...this.inorder(node.right)];
  }

  // 전위 순회: 트리 복사에 유용
  preorder(node: BSTNode | null = this.root): number[] {
    if (!node) return [];
    return [node.value, ...this.preorder(node.left), ...this.preorder(node.right)];
  }

  // 후위 순회: 트리 삭제에 유용
  postorder(node: BSTNode | null = this.root): number[] {
    if (!node) return [];
    return [...this.postorder(node.left), ...this.postorder(node.right), node.value];
  }

  min(): number | null {
    if (!this.root) return null;
    let node = this.root;
    while (node.left) node = node.left;
    return node.value;
  }

  max(): number | null {
    if (!this.root) return null;
    let node = this.root;
    while (node.right) node = node.right;
    return node.value;
  }
}

export { BST, BSTNode };
