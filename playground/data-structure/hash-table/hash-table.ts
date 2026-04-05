class HashTable<T> {
  private buckets: Array<Array<[string, T]>>;
  private capacity: number;
  private count = 0;

  constructor(capacity = 53) {
    this.capacity = capacity;
    this.buckets = Array.from({ length: capacity }, () => []);
  }

  private hash(key: string): number {
    let hash = 0;
    const prime = 31;
    for (let i = 0; i < key.length; i++) {
      hash = (hash * prime + key.charCodeAt(i)) % this.capacity;
    }
    return hash;
  }

  set(key: string, value: T): void {
    const index = this.hash(key);
    const bucket = this.buckets[index]!;
    const existing = bucket.find(([k]) => k === key);
    if (existing) {
      existing[1] = value;
    } else {
      bucket.push([key, value]);
      this.count++;
    }
  }

  get(key: string): T | undefined {
    const index = this.hash(key);
    const found = this.buckets[index]!.find(([k]) => k === key);
    return found?.[1];
  }

  delete(key: string): boolean {
    const index = this.hash(key);
    const bucket = this.buckets[index]!;
    const i = bucket.findIndex(([k]) => k === key);
    if (i === -1) return false;
    bucket.splice(i, 1);
    this.count--;
    return true;
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  get size(): number {
    return this.count;
  }
}

export { HashTable };
