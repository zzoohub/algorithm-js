class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEnd: boolean = false;
}

class Trie {
  root: TrieNode = new TrieNode();

  insert(word: string) {
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
    const node = this.find(word);
    return node !== null && node.isEnd;
  }

  startsWith(prefix: string): boolean {
    return this.find(prefix) !== null;
  }

  autocomplete(prefix: string): string[] {
    const node = this.find(prefix);
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

  private find(word: string): TrieNode | null {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) return null;
      node = node.children.get(ch)!;
    }
    return node;
  }
}
