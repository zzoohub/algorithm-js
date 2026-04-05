// 레벨 0이 기본 연결 리스트, 상위 레벨이 "고속도로" 역할
class SkipNode<T> {
  value: T;
  forward: (SkipNode<T> | null)[]; // forward[i] = i번째 레벨의 다음 노드

  constructor(value: T, level: number) {
    this.value = value;
    this.forward = new Array(level + 1).fill(null);
  }
}

class SkipList {
  private maxLevel: number;
  private level = 0; // 현재 최대 레벨
  private header: SkipNode<number>;
  private probability = 0.5; // 상위 레벨에 올라갈 확률

  constructor(maxLevel = 16) {
    this.maxLevel = maxLevel;
    this.header = new SkipNode(-Infinity, maxLevel);
  }

  // 동전 던지기로 노드의 레벨을 결정
  private randomLevel(): number {
    let level = 0;
    while (Math.random() < this.probability && level < this.maxLevel) {
      level++;
    }
    return level;
  }

  insert(value: number): void {
    // 각 레벨에서 새 노드가 삽입될 위치의 바로 이전 노드를 기록
    // update[i] = 레벨 i에서 새 노드의 앞에 올 노드
    const update: SkipNode<number>[] = new Array(this.maxLevel + 1);
    let current = this.header;

    // 가장 높은 레벨부터 내려가며 삽입 위치 탐색
    for (let i = this.level; i >= 0; i--) {
      while (current.forward[i] && current.forward[i]!.value < value) {
        current = current.forward[i]!;
      }
      update[i] = current;
    }

    const newLevel = this.randomLevel();

    // 새 레벨이 현재 최대 레벨보다 높으면 header를 업데이트
    if (newLevel > this.level) {
      for (let i = this.level + 1; i <= newLevel; i++) {
        update[i] = this.header;
      }
      this.level = newLevel;
    }

    const newNode = new SkipNode(value, newLevel);

    // 각 레벨의 포인터를 연결
    for (let i = 0; i <= newLevel; i++) {
      newNode.forward[i] = update[i]!.forward[i];
      update[i]!.forward[i] = newNode;
    }
  }

  search(value: number): boolean {
    let current = this.header;
    for (let i = this.level; i >= 0; i--) {
      while (current.forward[i] && current.forward[i]!.value < value) {
        current = current.forward[i]!;
      }
    }
    current = current.forward[0]!;
    return current !== null && current.value === value;
  }

  delete(value: number): boolean {
    const update: SkipNode<number>[] = new Array(this.maxLevel + 1);
    let current = this.header;

    for (let i = this.level; i >= 0; i--) {
      while (current.forward[i] && current.forward[i]!.value < value) {
        current = current.forward[i]!;
      }
      update[i] = current;
    }

    current = current.forward[0]!;
    if (!current || current.value !== value) return false;

    for (let i = 0; i <= this.level; i++) {
      if (update[i]!.forward[i] !== current) break;
      update[i]!.forward[i] = current.forward[i];
    }

    // 빈 레벨 제거
    while (this.level > 0 && !this.header.forward[this.level]) {
      this.level--;
    }
    return true;
  }

  // 정렬된 순서로 반환
  toArray(): number[] {
    const result: number[] = [];
    let current = this.header.forward[0];
    while (current) {
      result.push(current.value);
      current = current.forward[0];
    }
    return result;
  }
}

export { SkipList };
