// Doubly Linked List 노드
class DLLNode<K, V> {
  key: K;
  value: V;
  prev: DLLNode<K, V> | null = null;
  next: DLLNode<K, V> | null = null;

  constructor(key: K, value: V) {
    this.key = key;
    this.value = value;
  }
}

class LRUCache<K, V> {
  private capacity: number;
  private map = new Map<K, DLLNode<K, V>>();

  // 더미 head/tail로 경계 조건을 없앤다
  private head = new DLLNode<K, V>(null as K, null as V);
  private tail = new DLLNode<K, V>(null as K, null as V);

  constructor(capacity: number) {
    this.capacity = capacity;
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  get(key: K): V | undefined {
    const node = this.map.get(key);
    if (!node) return undefined;
    // 사용했으니 맨 앞으로 이동
    this.removeNode(node);
    this.addToFront(node);
    return node.value;
  }

  put(key: K, value: V): void {
    const existing = this.map.get(key);
    if (existing) {
      existing.value = value;
      this.removeNode(existing);
      this.addToFront(existing);
      return;
    }

    const node = new DLLNode(key, value);
    this.map.set(key, node);
    this.addToFront(node);

    // 용량 초과 시 가장 오래된 항목(tail 쪽) 제거
    if (this.map.size > this.capacity) {
      const lru = this.tail.prev!;
      this.removeNode(lru);
      this.map.delete(lru.key);
    }
  }

  get size(): number {
    return this.map.size;
  }

  // --- 내부 연결 리스트 조작 ---

  private addToFront(node: DLLNode<K, V>): void {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next!.prev = node;
    this.head.next = node;
  }

  private removeNode(node: DLLNode<K, V>): void {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  }
}

export { LRUCache };
