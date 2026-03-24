class HashTable<T> {
  store: Array<Array<[string, T]>>;
  size: number;
  constructor() {
    this.size = 53;
    this.store = Array.from({ length: this.size });
  }

  hash(key: string): number {
    let hash = 0;
    const prime = 31;
    for (let i = 0; i < key.length; i++) {
      hash = (hash * prime + key.charCodeAt(i)) % this.size;
    }
    return hash;
  }

  set(key: string, value: T) {
    const index = this.hash(key);
    this.store[index] ??= [];

    const existing = this.store[index].find(([k]) => k === key);
    if (existing) {
      existing[1] = value;
      return;
    }
    this.store[index].push([key, value]);
  }

  get(key: string) {
    const index = this.hash(key);
    if (!this.store[index]) return null;
    const found = this.store[index].find(([k]) => k === key);
    return found ? found[1] : null; // ✅ value만 반환
  }
}
