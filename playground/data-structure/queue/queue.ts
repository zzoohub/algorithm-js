class QueueNode<T> {
  value: T;
  next: QueueNode<T> | null = null;
  constructor(value: T) {
    this.value = value;
  }
}

class Queue<T> {
  private head: QueueNode<T> | null = null;
  private tail: QueueNode<T> | null = null;
  private length = 0;

  enqueue(data: T): void {
    const node = new QueueNode(data);
    if (!this.tail) {
      this.head = this.tail = node;
    } else {
      this.tail.next = node;
      this.tail = node;
    }
    this.length++;
  }

  dequeue(): T | null {
    if (!this.head) return null;
    const value = this.head.value;
    this.head = this.head.next;
    if (!this.head) this.tail = null;
    this.length--;
    return value;
  }

  peek(): T | null {
    return this.head?.value ?? null;
  }

  isEmpty(): boolean {
    return this.head === null;
  }

  get size(): number {
    return this.length;
  }
}

export { Queue };
