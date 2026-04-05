class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEnd = false;
}

class Trie {
  root = new TrieNode();

  insert(word: string): void {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) {
        node.children.set(ch, new TrieNode());
      }
      node = node.children.get(ch)!;
    }
    node.isEnd = true;
  }

  search(word: string): boolean {
    const node = this.traverse(word);
    return node !== null && node.isEnd;
  }

  startsWith(prefix: string): boolean {
    return this.traverse(prefix) !== null;
  }

  autocomplete(prefix: string): string[] {
    const node = this.traverse(prefix);
    if (!node) return [];
    const results: string[] = [];

    const dfs = (node: TrieNode, path: string) => {
      if (node.isEnd) results.push(path);
      for (const [ch, child] of node.children) {
        dfs(child, path + ch);
      }
    };

    dfs(node, prefix);
    return results;
  }

  delete(word: string): boolean {
    return this._delete(this.root, word, 0);
  }

  private _delete(node: TrieNode, word: string, depth: number): boolean {
    if (depth === word.length) {
      if (!node.isEnd) return false;
      node.isEnd = false;
      return node.children.size === 0; // 자식이 없으면 부모에서 삭제 가능
    }

    const ch = word[depth]!;
    const child = node.children.get(ch);
    if (!child) return false;

    const shouldDeleteChild = this._delete(child, word, depth + 1);
    if (shouldDeleteChild) {
      node.children.delete(ch);
      return !node.isEnd && node.children.size === 0;
    }
    return false;
  }

  private traverse(word: string): TrieNode | null {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) return null;
      node = node.children.get(ch)!;
    }
    return node;
  }
}

export { Trie, TrieNode };
