// ============================================
// 블록 구조 (Block Structure)
// ============================================
// 블록체인의 기본 단위인 "블록"과 블록들이 연결된 "체인"을 구현.
//
// 블록 = 헤더(메타데이터) + 바디(트랜잭션 목록)
// 체인 = 각 블록이 이전 블록의 해시를 포함 → "해시 체인"
//
// 왜 해시로 연결하는가?
// - 블록 하나를 변조하면 그 블록의 해시가 바뀜
// - 다음 블록에 저장된 previousHash와 불일치
// - 다음 블록도 수정해야 → 그 다음도... → 체인 전체를 다시 만들어야 함
// - PoW가 있으면 이 "다시 만들기"에 막대한 계산이 필요 → 사실상 불가능
//
// 이것이 블록체인이 "변조 불가능(immutable)"하다고 불리는 이유.

// ============================================
// FNV-1a 해시 함수 (학습용 간이 해시)
// ============================================
// 실제 블록체인은 SHA-256을 사용하지만, 여기서는 원리 학습을 위해
// 간단하면서도 잘 분산되는 FNV-1a를 사용.
// FNV-1a: offset basis에서 시작 → 각 바이트마다 XOR 후 prime 곱셈
function fnv1aHash(input: string): string {
  // FNV-1a 32비트 파라미터
  const FNV_OFFSET_BASIS = 0x811c9dc5;
  const FNV_PRIME = 0x01000193;

  let hash = FNV_OFFSET_BASIS;

  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);              // XOR: 입력 바이트를 섞음
    hash = Math.imul(hash, FNV_PRIME) >>> 0;  // 곱셈: 비트를 확산 (눈사태 효과)
  }

  // 8자리 hex 문자열로 반환 (32비트 = 4바이트 = 8자 hex)
  return hash.toString(16).padStart(8, "0");
}

// ============================================
// Block 클래스
// ============================================
// 블록 = 블록체인의 한 "페이지"
// 헤더: index, timestamp, previousHash, nonce, hash (메타데이터)
// 바디: transactions (실제 데이터)
class Block {
  index: number;           // 블록 번호 (0부터 시작, 제네시스 블록 = 0)
  timestamp: number;       // 블록 생성 시각 (Unix timestamp, ms)
  transactions: string[];  // 트랜잭션 목록 (블록의 "바디")
  previousHash: string;    // 이전 블록의 해시 → 체인 연결의 핵심!
  nonce: number;           // 채굴에 사용되는 값 (PoW에서 조정하는 유일한 변수)
  hash: string;            // 이 블록의 해시 (위 모든 필드로부터 계산)

  constructor(
    index: number,
    timestamp: number,
    transactions: string[],
    previousHash: string,
  ) {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = 0;
    // 블록 생성 시 해시를 계산하여 저장
    this.hash = this.calculateHash();
  }

  // 블록의 모든 필드를 하나의 문자열로 합쳐서 해시를 계산
  // → 어떤 필드라도 바뀌면 해시가 완전히 달라짐 (눈사태 효과)
  calculateHash(): string {
    const data = [
      this.index,
      this.timestamp,
      JSON.stringify(this.transactions),
      this.previousHash,
      this.nonce,
    ].join("|");

    return fnv1aHash(data);
  }
}

// ============================================
// Blockchain 클래스
// ============================================
// 블록들의 연결 리스트. 각 블록은 이전 블록의 해시를 참조.
//
// [Genesis] ← hash₀
//     ↓ previousHash = hash₀
// [Block 1] ← hash₁
//     ↓ previousHash = hash₁
// [Block 2] ← hash₂
class Blockchain {
  chain: Block[];
  difficulty: number; // PoW 난이도: 해시 앞에 0이 몇 개 와야 하는지

  constructor(difficulty: number = 2) {
    this.difficulty = difficulty;
    this.chain = [this.createGenesisBlock()];
  }

  // 제네시스 블록: 체인의 첫 번째 블록
  // previousHash = "0" (이전 블록이 없으므로 임의의 값)
  // 모든 블록체인은 제네시스 블록에서 시작
  // 비트코인의 제네시스 블록: 2009년 1월 3일, 사토시 나카모토가 생성
  createGenesisBlock(): Block {
    const genesis = new Block(0, Date.now(), ["Genesis Block"], "0");
    // 제네시스 블록도 채굴 (PoW 수행)
    this.mineBlock(genesis);
    return genesis;
  }

  // 새 블록을 체인에 추가
  // 1. 이전 블록의 해시를 가져와서 새 블록에 연결
  // 2. 채굴(PoW)을 통해 유효한 해시를 찾음
  // 3. 체인에 추가
  addBlock(transactions: string[]): Block {
    const previousBlock = this.chain[this.chain.length - 1]!;
    const newBlock = new Block(
      this.chain.length,       // index: 다음 번호
      Date.now(),              // timestamp: 현재 시각
      transactions,            // 포함할 트랜잭션들
      previousBlock.hash,      // 이전 블록의 해시로 연결!
    );

    this.mineBlock(newBlock);
    this.chain.push(newBlock);
    return newBlock;
  }

  // 간단한 Proof of Work (작업 증명)
  // "해시의 앞 N자리가 모두 0"인 nonce를 찾을 때까지 반복
  // difficulty = 2이면 해시가 "00..."으로 시작해야 함
  //
  // 왜 이것이 "작업 증명"인가?
  // - 유효한 nonce를 찾는 유일한 방법은 하나씩 시도하는 것 (brute force)
  // - 해시의 역상 저항성 때문에 지름길이 없음
  // - 찾는 데 시간이 걸리지만, 검증은 한 번의 해시 계산으로 즉시 가능
  private mineBlock(block: Block): void {
    const target = "0".repeat(this.difficulty); // 예: difficulty=2 → "00"

    while (!block.hash.startsWith(target)) {
      block.nonce++;                    // nonce를 1씩 증가시키며 시도
      block.hash = block.calculateHash(); // 새 nonce로 해시 재계산
    }
  }

  // 체인 전체의 무결성을 검증
  // 두 가지를 확인:
  // 1. 각 블록의 해시가 실제 데이터로부터 올바르게 계산되었는가?
  // 2. 각 블록의 previousHash가 실제 이전 블록의 hash와 일치하는가?
  //
  // 하나라도 실패하면 체인이 변조된 것!
  isValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i]!;
      const previous = this.chain[i - 1]!;

      // 검증 1: 저장된 해시 vs 다시 계산한 해시
      // → 블록 내용이 변조되었으면 불일치
      if (current.hash !== current.calculateHash()) {
        console.log(`  [실패] 블록 ${i}: 해시 불일치 (블록 내용이 변조됨)`);
        return false;
      }

      // 검증 2: 이 블록의 previousHash vs 이전 블록의 실제 hash
      // → 체인 연결이 끊어졌으면 불일치
      if (current.previousHash !== previous.hash) {
        console.log(`  [실패] 블록 ${i}: 이전 해시 불일치 (체인 연결이 끊어짐)`);
        return false;
      }
    }

    return true;
  }

  // 블록 변조 시뮬레이션
  // 특정 블록의 트랜잭션을 변경하면 어떤 일이 벌어지는지 보여줌
  //
  // 변조 후 상태:
  // - 변조된 블록의 해시가 달라짐 (데이터가 바뀌었으므로)
  // - 하지만 저장된 hash는 옛날 값 그대로 → 검증 1 실패
  // - 다음 블록의 previousHash도 옛날 해시를 가리킴 → 검증 2도 실패
  // - 즉, 한 블록만 변조해도 그 블록부터 체인 끝까지 모두 무효화
  tamper(blockIndex: number, newTransactions: string[]): void {
    if (blockIndex <= 0 || blockIndex >= this.chain.length) {
      console.log("  변조 실패: 유효하지 않은 블록 인덱스 (제네시스 블록은 변조 불가)");
      return;
    }

    const block = this.chain[blockIndex]!;
    console.log(`  변조 전 해시: ${block.hash}`);
    console.log(`  변조 전 트랜잭션: ${JSON.stringify(block.transactions)}`);

    // 트랜잭션을 변경 (해시는 재계산하지 않음 → 의도적으로 불일치 유발)
    block.transactions = newTransactions;

    console.log(`  변조 후 트랜잭션: ${JSON.stringify(block.transactions)}`);
    console.log(`  저장된 해시: ${block.hash} (옛날 값 그대로)`);
    console.log(`  실제 해시:   ${block.calculateHash()} (데이터가 바뀌어서 달라짐!)`);
  }

  // 체인을 시각적으로 출력
  printChain(): void {
    for (const block of this.chain) {
      const label = block.index === 0 ? " (Genesis)" : "";
      console.log(`  [Block ${block.index}${label}]`);
      console.log(`    Hash:         ${block.hash}`);
      console.log(`    Previous:     ${block.previousHash}`);
      console.log(`    Transactions: ${JSON.stringify(block.transactions)}`);
      console.log(`    Nonce:        ${block.nonce}`);
      console.log(`    Timestamp:    ${new Date(block.timestamp).toISOString()}`);
      console.log("");
    }
  }
}

// ============================================
// 데모: 블록체인의 무결성 검증과 변조 감지
// ============================================
function demo(): void {
  console.log("=".repeat(60));
  console.log("블록체인 블록 구조 데모");
  console.log("=".repeat(60));
  console.log("");

  // 1. 체인 생성 (difficulty=2: 해시가 "00"으로 시작해야 함)
  console.log("1. 블록체인 생성 (난이도 = 2)");
  console.log("-".repeat(40));
  const blockchain = new Blockchain(2);
  console.log("   제네시스 블록 생성 완료\n");

  // 2. 블록 추가
  console.log("2. 블록 추가");
  console.log("-".repeat(40));

  blockchain.addBlock([
    "Alice → Bob: 10 BTC",
    "Charlie → Dave: 5 BTC",
  ]);
  console.log("   Block 1 추가 완료");

  blockchain.addBlock([
    "Bob → Eve: 3 BTC",
    "Dave → Alice: 7 BTC",
  ]);
  console.log("   Block 2 추가 완료");

  blockchain.addBlock([
    "Eve → Charlie: 2 BTC",
  ]);
  console.log("   Block 3 추가 완료\n");

  // 3. 체인 출력
  console.log("3. 현재 체인 상태");
  console.log("-".repeat(40));
  blockchain.printChain();

  // 4. 체인 검증 (변조 전 — 유효해야 함)
  console.log("4. 체인 무결성 검증 (변조 전)");
  console.log("-".repeat(40));
  const validBefore = blockchain.isValid();
  console.log(`   결과: ${validBefore ? "유효함 ✓" : "무효! ✗"}\n`);

  // 5. 블록 변조 시도
  console.log("5. 블록 1 변조 시도");
  console.log("-".repeat(40));
  console.log('   "Alice → Bob: 10 BTC"를 "Alice → Mallory: 100 BTC"로 변경\n');
  blockchain.tamper(1, [
    "Alice → Mallory: 100 BTC",  // 10 BTC를 100 BTC로 위조!
    "Charlie → Dave: 5 BTC",
  ]);
  console.log("");

  // 6. 체인 검증 (변조 후 — 실패해야 함!)
  console.log("6. 체인 무결성 검증 (변조 후)");
  console.log("-".repeat(40));
  const validAfter = blockchain.isValid();
  console.log(`   결과: ${validAfter ? "유효함 ✓" : "무효! ✗ — 변조가 감지되었습니다!"}\n`);

  // 7. 교훈
  console.log("=".repeat(60));
  console.log("핵심 교훈:");
  console.log("  1. 블록은 해시로 연결되어 있다 (해시 체인)");
  console.log("  2. 한 블록을 변조하면 해시가 달라진다");
  console.log("  3. 다음 블록의 previousHash와 불일치 → 즉시 감지");
  console.log("  4. 체인을 속이려면 변조된 블록부터 끝까지 전부 재채굴 필요");
  console.log("  5. PoW 난이도가 높을수록 재채굴 비용이 기하급수적으로 증가");
  console.log("=".repeat(60));
}

export { Block, Blockchain, fnv1aHash };

// 직접 실행 시 데모 수행
demo();
