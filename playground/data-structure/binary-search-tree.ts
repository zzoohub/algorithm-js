class Node {
  value: number;
  left: Node | null = null;
  right: Node | null = null;
  constructor(value: number) {
    this.value = value;
  }
}

class BST {
  root: Node | null = null;

  insert(value: number) {
    const node = new Node(value);
    if (!this.root) {
      this.root = node;
      return;
    }
    let current = this.root;
    while (true) {
      if (value === current.value) return;
      if (value < current.value) {
        if (!current.left) {
          current.left = node;
          return;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = node;
          return;
        }
        current = current.right;
      }
    }
  }

  inorder(node: Node | null = this.root): void {
    if (!node) return;
    this.inorder(node.left);
    console.log(node.value);
    this.inorder(node.right);
  }

  preorder(node: Node | null = this.root): void {
    if (!node) return;
    console.log(node.value);
    this.preorder(node.left);
    this.preorder(node.right);
  }

  postorder(node: Node | null = this.root): void {
    if (!node) return;
    this.postorder(node.left);
    this.postorder(node.right);
    console.log(node.value);
  }

  search(value: number): Node | null {
    let current = this.root;
    while (current) {
      if (value === current.value) return current;
      current = value < current.value ? current.left : current.right;
    }
    return null;
  }
}
