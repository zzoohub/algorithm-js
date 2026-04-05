class Heap<T> {
  private store: T[] = [];
  private compare: (a: T, b: T) => boolean;

  // compare: (a, b) => true이면 a가 위로 올라간다
  // MinHeap: (a, b) => a < b
  // MaxHeap: (a, b) => a > b
  constructor(compare: (a: T, b: T) => boolean) {
    this.compare = compare;
  }

  static minHeap(): Heap<number> {
    return new Heap<number>((a, b) => a < b);
  }

  static maxHeap(): Heap<number> {
    return new Heap<number>((a, b) => a > b);
  }

  private parentIndex(index: number) { return Math.floor((index - 1) / 2); }
  private leftIndex(index: number) { return 2 * index + 1; }
  private rightIndex(index: number) { return 2 * index + 2; }

  private swap(i: number, j: number) {
    [this.store[i], this.store[j]] = [this.store[j]!, this.store[i]!];
  }

  private bubbleUp() {
    let i = this.store.length - 1;
    while (i > 0) {
      const parent = this.parentIndex(i);
      if (!this.compare(this.store[i]!, this.store[parent]!)) break;
      this.swap(i, parent);
      i = parent;
    }
  }

  private bubbleDown() {
    let i = 0;
    while (true) {
      const left = this.leftIndex(i);
      const right = this.rightIndex(i);
      let target = i;

      if (left < this.store.length && this.compare(this.store[left]!, this.store[target]!))
        target = left;
      if (right < this.store.length && this.compare(this.store[right]!, this.store[target]!))
        target = right;

      if (target === i) break;
      this.swap(i, target);
      i = target;
    }
  }

  insert(value: T): void {
    this.store.push(value);
    this.bubbleUp();
  }

  extract(): T | null {
    if (!this.store.length) return null;
    const top = this.store[0]!;
    const last = this.store.pop()!;
    if (this.store.length) {
      this.store[0] = last;
      this.bubbleDown();
    }
    return top;
  }

  peek(): T | null {
    return this.store[0] ?? null;
  }

  get size(): number {
    return this.store.length;
  }

  isEmpty(): boolean {
    return this.store.length === 0;
  }
}

export { Heap };
