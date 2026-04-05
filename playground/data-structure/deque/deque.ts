// 이중 연결 리스트 기반 Deque
class DequeNode<T> {
  value: T;
  prev: DequeNode<T> | null = null;
  next: DequeNode<T> | null = null;
  constructor(value: T) {
    this.value = value;
  }
}

class Deque<T> {
  private head: DequeNode<T> | null = null;
  private tail: DequeNode<T> | null = null;
  private length = 0;

  // 앞에 추가
  pushFront(value: T): void {
    const node = new DequeNode(value);
    if (!this.head) {
      this.head = this.tail = node;
    } else {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
    }
    this.length++;
  }

  // 뒤에 추가
  pushBack(value: T): void {
    const node = new DequeNode(value);
    if (!this.tail) {
      this.head = this.tail = node;
    } else {
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
    }
    this.length++;
  }

  // 앞에서 제거
  popFront(): T | null {
    if (!this.head) return null;
    const value = this.head.value;
    this.head = this.head.next;
    if (this.head) {
      this.head.prev = null;
    } else {
      this.tail = null;
    }
    this.length--;
    return value;
  }

  // 뒤에서 제거
  popBack(): T | null {
    if (!this.tail) return null;
    const value = this.tail.value;
    this.tail = this.tail.prev;
    if (this.tail) {
      this.tail.next = null;
    } else {
      this.head = null;
    }
    this.length--;
    return value;
  }

  peekFront(): T | null {
    return this.head?.value ?? null;
  }

  peekBack(): T | null {
    return this.tail?.value ?? null;
  }

  isEmpty(): boolean {
    return this.length === 0;
  }

  get size(): number {
    return this.length;
  }
}

export { Deque };
