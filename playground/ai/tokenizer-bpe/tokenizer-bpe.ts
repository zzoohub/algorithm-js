// ============================================
// BPE (Byte Pair Encoding) 토크나이저
// ============================================
// LLM(GPT, Claude 등)의 입력 처리 첫 단계.
// "텍스트를 어떤 단위로 쪼갤 것인가?"
//
// 문자 단위: "hello" → ["h","e","l","l","o"]  — 어휘 26개, 시퀀스 길다
// 단어 단위: "hello" → ["hello"]              — 어휘 수만~수십만, OOV 문제
// BPE:       "hello" → ["hel","lo"]           — 균형: 어휘 수천~수만, 서브워드
//
// 핵심 아이디어: 자주 나타나는 문자 쌍을 반복적으로 합쳐서 어휘를 구축.
//
// 1. 초기: 모든 문자가 각각의 토큰
// 2. 가장 자주 등장하는 인접 쌍을 찾아 하나로 합침
// 3. 원하는 어휘 크기가 될 때까지 반복
//
// 예) 학습 데이터: "low lower lowest"
// 초기 토큰: l o w e r s t
// 빈도 높은 쌍: (l, o) → "lo"
// 다음: (lo, w) → "low"
// 다음: (e, r) → "er"
// → 어휘: {l, o, w, e, r, s, t, lo, low, er, low, lower, ...}

// ============================================
// 1. BPE 학습 (Vocabulary 구축)
// ============================================
function trainBPE(
  corpus: string[],     // 학습 텍스트 (단어 목록)
  numMerges: number     // 합병 횟수 (= 추가 토큰 수)
): {
  merges: Array<[string, string]>;
  vocab: Set<string>;
} {
  // 각 단어를 문자 단위로 분리 + 빈도 카운트
  // "low" → ["l", "o", "w", "</w>"]  (</w>는 단어 끝 표시)
  const wordFreq = new Map<string, number>();
  for (const word of corpus) {
    const key = word.split("").join(" ") + " </w>";
    wordFreq.set(key, (wordFreq.get(key) ?? 0) + 1);
  }

  const merges: Array<[string, string]> = [];

  // 예시 워크스루:
  // 학습 데이터: ["low", "low", "low", "lower"]
  // 초기 wordFreq: {"l o w </w>": 3, "l o w e r </w>": 1}
  //
  // 반복 1: (l, o) 빈도=4 → "lo" 생성
  //   → {"lo w </w>": 3, "lo w e r </w>": 1}
  // 반복 2: (lo, w) 빈도=4 → "low" 생성
  //   → {"low </w>": 3, "low e r </w>": 1}
  // 이런 식으로 자주 나타나는 쌍이 하나의 토큰으로 합쳐진다!

  for (let i = 0; i < numMerges; i++) {
    // 가장 빈도 높은 인접 쌍 찾기
    const pairCounts = new Map<string, number>();

    for (const [word, freq] of wordFreq) {
      const symbols = word.split(" ");
      for (let j = 0; j < symbols.length - 1; j++) {
        const pair = `${symbols[j]}|${symbols[j + 1]}`;
        pairCounts.set(pair, (pairCounts.get(pair) ?? 0) + freq);
      }
    }

    if (pairCounts.size === 0) break;

    // 최빈 쌍 선택
    let bestPair = "";
    let bestCount = 0;
    for (const [pair, count] of pairCounts) {
      if (count > bestCount) {
        bestCount = count;
        bestPair = pair;
      }
    }

    const [a, b] = bestPair.split("|") as [string, string];
    merges.push([a, b]);

    // 해당 쌍을 합병 (모든 단어에서)
    const newWordFreq = new Map<string, number>();
    for (const [word, freq] of wordFreq) {
      // "l o w" 에서 (l, o)를 합치면 "lo w"
      const newWord = word.split(`${a} ${b}`).join(`${a}${b}`);
      newWordFreq.set(newWord, freq);
    }

    wordFreq.clear();
    for (const [k, v] of newWordFreq) wordFreq.set(k, v);
  }

  // 최종 어휘: 모든 고유 토큰
  const vocab = new Set<string>();
  for (const word of wordFreq.keys()) {
    for (const token of word.split(" ")) {
      vocab.add(token);
    }
  }

  return { merges, vocab };
}

// ============================================
// 2. BPE 인코딩 (텍스트 → 토큰)
// ============================================
function encodeBPE(
  word: string,
  merges: Array<[string, string]>
): string[] {
  // 문자 단위로 시작
  let symbols = word.split("").concat(["</w>"]);

  // 학습된 합병 규칙을 순서대로 적용
  for (const [a, b] of merges) {
    const newSymbols: string[] = [];
    let i = 0;

    while (i < symbols.length) {
      // 현재 위치에서 합병 가능하면 합침
      if (i < symbols.length - 1 && symbols[i] === a && symbols[i + 1] === b) {
        newSymbols.push(a + b);
        i += 2;
      } else {
        newSymbols.push(symbols[i]!);
        i++;
      }
    }

    symbols = newSymbols;
  }

  return symbols;
}

// ============================================
// 3. 간단한 토크나이저 (텍스트 → 정수 ID)
// ============================================
class SimpleTokenizer {
  private tokenToId: Map<string, number>;
  private idToToken: Map<number, string>;
  private merges: Array<[string, string]>;

  constructor(merges: Array<[string, string]>, vocab: Set<string>) {
    this.merges = merges;
    this.tokenToId = new Map();
    this.idToToken = new Map();

    let id = 0;
    for (const token of vocab) {
      this.tokenToId.set(token, id);
      this.idToToken.set(id, token);
      id++;
    }
  }

  // 텍스트 → 토큰 ID 배열
  encode(text: string): number[] {
    const words = text.toLowerCase().split(/\s+/);
    const ids: number[] = [];

    for (const word of words) {
      const tokens = encodeBPE(word, this.merges);
      for (const token of tokens) {
        const id = this.tokenToId.get(token);
        if (id !== undefined) ids.push(id);
      }
    }

    return ids;
  }

  // 토큰 ID 배열 → 텍스트
  decode(ids: number[]): string {
    return ids
      .map(id => this.idToToken.get(id) ?? "?")
      .join("")
      .replace(/\s*<\/w>\s*/g, " ")
      .trim();
  }

  get vocabSize(): number {
    return this.tokenToId.size;
  }
}

export { trainBPE, encodeBPE, SimpleTokenizer };
