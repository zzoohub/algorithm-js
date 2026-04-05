class Stack<T> {
  private items: T[] = [];

  push(data: T): void {
    this.items.push(data);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items.at(-1);
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  get size(): number {
    return this.items.length;
  }
}

export { Stack };
