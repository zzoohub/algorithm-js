class RingBuffer<T> {
  private buffer: (T | undefined)[];
  private capacity: number;
  private head = 0;   // 읽기 위치 (가장 오래된 데이터)
  private tail = 0;   // 쓰기 위치 (다음 쓸 자리)
  private length = 0;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.buffer = new Array(capacity);
  }

  // 데이터 쓰기. 가득 차면 가장 오래된 데이터를 덮어쓴다.
  write(value: T): void {
    this.buffer[this.tail] = value;
    this.tail = (this.tail + 1) % this.capacity;

    if (this.length === this.capacity) {
      // 가득 찬 상태에서 쓰면 head도 전진 (오래된 데이터 버림)
      this.head = (this.head + 1) % this.capacity;
    } else {
      this.length++;
    }
  }

  // 가장 오래된 데이터 읽기
  read(): T | undefined {
    if (this.length === 0) return undefined;
    const value = this.buffer[this.head];
    this.buffer[this.head] = undefined;
    this.head = (this.head + 1) % this.capacity;
    this.length--;
    return value;
  }

  peek(): T | undefined {
    if (this.length === 0) return undefined;
    return this.buffer[this.head];
  }

  isFull(): boolean {
    return this.length === this.capacity;
  }

  isEmpty(): boolean {
    return this.length === 0;
  }

  get size(): number {
    return this.length;
  }

  // 현재 저장된 데이터를 순서대로 반환 (디버깅용)
  toArray(): T[] {
    const result: T[] = [];
    for (let i = 0; i < this.length; i++) {
      result.push(this.buffer[(this.head + i) % this.capacity] as T);
    }
    return result;
  }
}

export { RingBuffer };
