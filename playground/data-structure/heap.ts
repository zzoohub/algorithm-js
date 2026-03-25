class Heap {
  store: number[];
  type: "min" | "max";

  constructor(type: "min" | "max") {
    this.store = [];
    this.type = type;
  }

  private parentIndex(i: number) {
    return Math.floor((i - 1) / 2);
  }
  private leftIndex(i: number) {
    return 2 * i + 1;
  }
  private rightIndex(i: number) {
    return 2 * i + 2;
  }

  private shouldSwap(a: number, b: number) {
    return this.type === "max" ? a > b : a < b;
  }

  private swap(i: number, j: number) {
    [this.store[i], this.store[j]] = [this.store[j], this.store[i]];
  }

  private bubbleUp() {
    let i = this.store.length - 1;
    while (i > 0) {
      const parent = this.parentIndex(i);
      if (!this.shouldSwap(this.store[i], this.store[parent])) break;
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

      if (
        left < this.store.length &&
        this.shouldSwap(this.store[left], this.store[target])
      )
        target = left;
      if (
        right < this.store.length &&
        this.shouldSwap(this.store[right], this.store[target])
      )
        target = right;

      if (target === i) break;
      this.swap(i, target);
      i = target;
    }
  }

  insert(value: number) {
    this.store.push(value);
    this.bubbleUp();
  }

  extract(): number | null {
    if (!this.store.length) return null;
    const top = this.store[0];
    const last = this.store.pop()!;
    if (this.store.length) {
      this.store[0] = last;
      this.bubbleDown();
    }
    return top;
  }

  peek(): number | null {
    return this.store[0] ?? null;
  }
}
