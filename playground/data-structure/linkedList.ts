class Node<T> {
  value: T;
  next: Node<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

class LinkedList<T> {
  head: Node<T> | null = null;
  tail: Node<T> | null = null;

  append(node: Node<T>) {
    if (!this.head) {
      this.head = node;
      this.tail = node;
      return;
    }
    this.tail!.next = node;
    this.tail = node;
  }

  prepend(node: Node<T>) {
    if (!this.head) {
      this.head = node;
      this.tail = node;
      return;
    }
    node.next = this.head;
    this.head = node;
  }

  delete(data: T) {
    while (this.head && this.head.value === data) {
      this.head = this.head.next;
      if (!this.head) this.tail = null; // 리스트가 비면 tail도 null
    }

    let current = this.head;
    while (current && current.next) {
      if (current.next.value === data) {
        if (current.next === this.tail) {
          this.tail = current;
        }
        current.next = current.next.next;
      } else {
        current = current.next;
      }
    }
  }

  search(data: T) {
    let current = this.head;
    while (current) {
      if (current.value === data) {
        return current;
      }
      current = current.next;
    }
  }

  print() {
    let current = this.head;
    while (current) {
      console.log(current.value);
      current = current.next;
    }
  }
}
