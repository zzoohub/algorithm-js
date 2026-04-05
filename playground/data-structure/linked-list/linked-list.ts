class ListNode<T> {
  value: T;
  next: ListNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

class LinkedList<T> {
  head: ListNode<T> | null = null;
  tail: ListNode<T> | null = null;
  private length = 0;

  append(data: T): void {
    const node = new ListNode(data);
    if (!this.head) {
      this.head = this.tail = node;
    } else {
      this.tail!.next = node;
      this.tail = node;
    }
    this.length++;
  }

  prepend(data: T): void {
    const node = new ListNode(data);
    if (!this.head) {
      this.head = this.tail = node;
    } else {
      node.next = this.head;
      this.head = node;
    }
    this.length++;
  }

  deleteFirst(): T | null {
    if (!this.head) return null;
    const value = this.head.value;
    this.head = this.head.next;
    if (!this.head) this.tail = null;
    this.length--;
    return value;
  }

  delete(data: T): boolean {
    if (!this.head) return false;

    if (this.head.value === data) {
      this.head = this.head.next;
      if (!this.head) this.tail = null;
      this.length--;
      return true;
    }

    let current = this.head;
    while (current.next) {
      if (current.next.value === data) {
        if (current.next === this.tail) this.tail = current;
        current.next = current.next.next;
        this.length--;
        return true;
      }
      current = current.next;
    }
    return false;
  }

  search(data: T): ListNode<T> | null {
    let current = this.head;
    while (current) {
      if (current.value === data) return current;
      current = current.next;
    }
    return null;
  }

  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  get size(): number {
    return this.length;
  }
}

export { LinkedList, ListNode };
