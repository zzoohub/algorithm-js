class Stack<T> {
  stacks: Array<T>;
  constructor() {
    this.stacks = [];
  }
  push(data: T) {
    this.stacks.push(data);
  }

  pop() {
    return this.stacks.pop();
  }

  peek() {
    return this.stacks.at(-1);
  }

  isEmpty() {
    return this.stacks.length === 0;
  }
}
