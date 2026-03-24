import { LinkedList } from "./linkedList";

class Queue<T> {
  queue: LinkedList<T>;
  constructor() {
    this.queue = new LinkedList();
  }

  enqueue(data: T) {
    this.queue.append(data);
  }

  dequeue() {
    return this.queue.dequeue();
  }

  peek() {
    return this.queue.peek();
  }

  isEmpty() {
    return this.queue.head === null;
  }
}
