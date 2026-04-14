// ============================================
// AVL Tree (자가 균형 이진 탐색 트리)
// ============================================
// BST의 치명적 약점: 정렬된 데이터를 넣으면 편향 트리가 되어 O(n).
// AVL Tree는 삽입/삭제 시 **회전(rotation)**으로 균형을 유지해서
// 항상 O(log n)을 보장한다.
//
// 불변량(invariant): 모든 노드에서 왼쪽과 오른쪽 서브트리의 높이 차이가 최대 1.
// 이것을 "Balance Factor"라고 부른다: BF = height(left) - height(right)
// BF ∈ {-1, 0, 1} → 균형 상태
// |BF| >= 2 → 불균형 → 회전으로 복구
//
// 4가지 불균형 케이스와 회전:
//
// LL (Left-Left):   오른쪽 회전
//       z                y
//      / \             /   \
//     y   T4   →     x      z
//    / \            / \    / \
//   x   T3        T1  T2 T3  T4
//  / \
// T1  T2
//
// RR (Right-Right): 왼쪽 회전
//   z                   y
//  / \                /   \
// T1   y      →     z      x
//     / \          / \    / \
//    T2   x      T1  T2 T3  T4
//        / \
//       T3  T4
//
// LR (Left-Right):  왼쪽 회전 → 오른쪽 회전
//     z               z               x
//    / \             / \            /     \
//   y   T4   →     x   T4   →   y         z
//  / \            / \           / \       / \
// T1   x        y   T3       T1   T2   T3   T4
//     / \      / \
//    T2  T3  T1  T2
//
// RL (Right-Left): 오른쪽 회전 → 왼쪽 회전

interface AVLNode<T> {
  value: T;
  left: AVLNode<T> | null;
  right: AVLNode<T> | null;
  height: number;
}

class AVLTree<T> {
  root: AVLNode<T> | null = null;

  // --- 유틸리티 ---

  private height(node: AVLNode<T> | null): number {
    return node ? node.height : 0;
  }

  private balanceFactor(node: AVLNode<T>): number {
    return this.height(node.left) - this.height(node.right);
  }

  private updateHeight(node: AVLNode<T>): void {
    node.height = 1 + Math.max(this.height(node.left), this.height(node.right));
  }

  // --- 회전 ---

  // 오른쪽 회전 (LL 케이스)
  //     y           x
  //    / \         / \
  //   x   C  →  A    y
  //  / \             / \
  // A   B           B   C
  private rotateRight(y: AVLNode<T>): AVLNode<T> {
    const x = y.left!;
    const B = x.right;

    x.right = y;
    y.left = B;

    this.updateHeight(y);
    this.updateHeight(x);
    return x; // x가 새로운 루트
  }

  // 왼쪽 회전 (RR 케이스)
  //   x              y
  //  / \            / \
  // A   y    →    x    C
  //    / \       / \
  //   B   C    A    B
  private rotateLeft(x: AVLNode<T>): AVLNode<T> {
    const y = x.right!;
    const B = y.left;

    y.left = x;
    x.right = B;

    this.updateHeight(x);
    this.updateHeight(y);
    return y;
  }

  // 불균형 감지 후 적절한 회전 수행
  private balance(node: AVLNode<T>): AVLNode<T> {
    this.updateHeight(node);
    const bf = this.balanceFactor(node);

    // LL: 왼쪽이 무거운데(bf>1), 왼쪽 자식도 왼쪽이 무거움(>=0) → 오른쪽 회전 1회
    if (bf > 1 && this.balanceFactor(node.left!) >= 0) {
      return this.rotateRight(node);
    }

    // LR: 왼쪽이 무거운데(bf>1), 왼쪽 자식은 오른쪽이 무거움(<0) → 2회 회전
    if (bf > 1 && this.balanceFactor(node.left!) < 0) {
      node.left = this.rotateLeft(node.left!);
      return this.rotateRight(node);
    }

    // RR: 오른쪽이 무거운데(bf<-1), 오른쪽 자식도 오른쪽이 무거움(<=0) → 왼쪽 회전 1회
    if (bf < -1 && this.balanceFactor(node.right!) <= 0) {
      return this.rotateLeft(node);
    }

    // RL: 오른쪽이 무거운데(bf<-1), 오른쪽 자식은 왼쪽이 무거움(>0) → 2회 회전
    if (bf < -1 && this.balanceFactor(node.right!) > 0) {
      node.right = this.rotateRight(node.right!);
      return this.rotateLeft(node);
    }

    return node; // 이미 균형
  }

  // --- 삽입 ---
  insert(value: T): void {
    this.root = this.insertNode(this.root, value);
  }

  private insertNode(node: AVLNode<T> | null, value: T): AVLNode<T> {
    // BST 삽입과 동일
    if (!node) return { value, left: null, right: null, height: 1 };

    if (value < node.value) {
      node.left = this.insertNode(node.left, value);
    } else if (value > node.value) {
      node.right = this.insertNode(node.right, value);
    } else {
      return node; // 중복 무시
    }

    // 삽입 후 균형 잡기 (여기가 BST와 다른 점!)
    return this.balance(node);
  }

  // --- 삭제 ---
  delete(value: T): void {
    this.root = this.deleteNode(this.root, value);
  }

  private deleteNode(node: AVLNode<T> | null, value: T): AVLNode<T> | null {
    if (!node) return null;

    if (value < node.value) {
      node.left = this.deleteNode(node.left, value);
    } else if (value > node.value) {
      node.right = this.deleteNode(node.right, value);
    } else {
      // 삭제할 노드를 찾음
      if (!node.left || !node.right) {
        // 자식이 0개 또는 1개
        return node.left ?? node.right;
      }
      // 자식이 2개: 오른쪽 서브트리의 최솟값(후행자)으로 교체
      const successor = this.findMin(node.right);
      node.value = successor.value;
      node.right = this.deleteNode(node.right, successor.value);
    }

    // 삭제 후 균형 잡기
    return this.balance(node);
  }

  private findMin(node: AVLNode<T>): AVLNode<T> {
    let current = node;
    while (current.left) current = current.left;
    return current;
  }

  // --- 탐색 ---
  search(value: T): boolean {
    let current = this.root;
    while (current) {
      if (value === current.value) return true;
      current = value < current.value ? current.left : current.right;
    }
    return false;
  }

  // 중위 순회 (정렬된 순서)
  inorder(): T[] {
    const result: T[] = [];
    const traverse = (node: AVLNode<T> | null) => {
      if (!node) return;
      traverse(node.left);
      result.push(node.value);
      traverse(node.right);
    };
    traverse(this.root);
    return result;
  }
}

export { AVLTree };
export type { AVLNode };
