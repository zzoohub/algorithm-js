// ============================================
// Gossip Protocol (가십 프로토콜)
// ============================================
// P2P 네트워크에서 메시지를 전파하는 분산 통신 프로토콜.
// 각 노드가 자신이 아는 정보를 무작위 피어 일부에게 전달하면,
// 그 피어들도 다시 자기 피어에게 전달 → 전염병처럼 네트워크 전체로 확산.
//
// 왜 가십인가? (vs 직접 브로드캐스트)
// - 직접 브로드캐스트: 1개 노드가 N-1개 노드에게 직접 전송
//   → O(N) 연결, 단일 장애점(보내는 노드가 죽으면 전파 실패)
// - 가십: 각 노드가 소수의 피어에게만 전달 (fanout 개)
//   → 각 노드의 부하는 O(fanout), 총 O(log N) 라운드로 전체 도달
//   → 일부 노드가 죽어도 다른 경로로 전파 (내결함성)
//
// 확률적 수렴 (Probabilistic Convergence):
// - 가십은 "반드시" 모든 노드에 도달한다고 보장하지는 않음
// - 하지만 fanout이 충분하면 O(log N) 라운드 안에
//   높은 확률(>99.9%)로 모든 노드에 도달
// - fanout이 클수록 빠르지만, 네트워크 부하가 증가 → 트레이드오프
//
// Fanout 파라미터:
// - fanout = 1: 느리고 도달 실패 확률 높음
// - fanout = 3~4: 대부분의 실무 시스템에서 사용하는 값
// - fanout = N-1: 모든 피어에게 전달 = 플러딩 (flooding)

// ============================================
// Node: P2P 네트워크의 개별 노드
// ============================================
class Node {
  id: string;
  // 이 노드와 직접 연결된 피어 목록
  peers: Set<Node>;
  // 이미 수신한 메시지 ID 집합 → 중복 전파 방지
  // 가십에서 핵심: 이미 아는 메시지는 다시 전파하지 않음
  knownMessages: Set<string>;

  constructor(id: string) {
    this.id = id;
    this.peers = new Set();
    this.knownMessages = new Set();
  }
}

// ============================================
// GossipNetwork: 가십 프로토콜 시뮬레이션
// ============================================
class GossipNetwork {
  nodes: Map<string, Node>;

  constructor() {
    this.nodes = new Map();
  }

  // 네트워크에 새 노드 추가
  addNode(id: string): Node {
    const node = new Node(id);
    this.nodes.set(id, node);
    return node;
  }

  // 양방향 피어 연결 (P2P이므로 항상 쌍방)
  // nodeA ↔ nodeB: 서로의 피어 목록에 추가
  connect(nodeA: Node, nodeB: Node): void {
    nodeA.peers.add(nodeB);
    nodeB.peers.add(nodeA);
  }

  // ============================================
  // 가십 브로드캐스트 (Push 방식)
  // ============================================
  // 1. fromNode가 메시지를 수신 (또는 생성)
  // 2. 자신의 피어 중 무작위 fanout 개를 선택
  // 3. 해당 피어들에게 메시지를 전달
  // 4. 메시지를 처음 받은 피어들만 다시 전파 (중복 방지)
  //
  // 이 한 라운드가 끝나면, 새로 메시지를 받은 노드들이
  // 다음 라운드에서 같은 과정을 반복 → 지수적 확산
  broadcast(
    fromNode: Node,
    message: string,
    fanout: number = 3,
  ): Node[] {
    // 이미 이 메시지를 아는 노드는 전파하지 않음
    if (fromNode.knownMessages.has(message)) {
      return [];
    }

    // 메시지 수신 기록
    fromNode.knownMessages.add(message);

    // 피어 중 아직 이 메시지를 모르는 노드만 후보로
    const candidatePeers = [...fromNode.peers].filter(
      (peer) => !peer.knownMessages.has(message),
    );

    // 후보 중 무작위 fanout 개를 선택 (Fisher-Yates 셔플 일부)
    const selected = this.selectRandom(candidatePeers, fanout);

    // 선택된 피어들에게 메시지 전달
    const newlyInformed: Node[] = [];
    for (const peer of selected) {
      if (!peer.knownMessages.has(message)) {
        peer.knownMessages.add(message);
        newlyInformed.push(peer);
      }
    }

    return newlyInformed;
  }

  // ============================================
  // 가십 라운드 시뮬레이션
  // ============================================
  // 실제 P2P에서는 비동기적이지만, 학습을 위해 동기적 라운드로 시뮬레이션.
  //
  // 라운드 진행:
  // R0: 시작 노드 1개가 메시지를 가짐
  // R1: 시작 노드가 fanout개 피어에게 전달 → ~fanout개 노드가 알게 됨
  // R2: R1에서 새로 알게 된 노드들이 각각 fanout개에게 전달
  //     → 최대 fanout^2 개 노드가 새로 알게 됨
  // ...반복 → 지수적으로 확산하여 O(log N) 라운드에 전체 도달
  simulateRounds(
    message: string,
    startNode: Node,
    fanout: number = 3,
  ): { roundsToConverge: number; messageReachPerRound: number[] } {
    const totalNodes = this.nodes.size;
    const messageReachPerRound: number[] = [];

    // 모든 노드의 메시지 상태 초기화
    for (const node of this.nodes.values()) {
      node.knownMessages.delete(message);
    }

    // R0: 시작 노드만 메시지를 가짐
    startNode.knownMessages.add(message);
    messageReachPerRound.push(1);

    // 현재 라운드에서 메시지를 전파할 노드들
    let activeNodes: Node[] = [startNode];
    let round = 0;

    while (activeNodes.length > 0) {
      round++;
      const nextActiveNodes: Node[] = [];

      // 현재 활성 노드들이 각각 가십 전파 수행
      for (const node of activeNodes) {
        const newlyInformed = this.gossipFromNode(node, message, fanout);
        nextActiveNodes.push(...newlyInformed);
      }

      // 이번 라운드까지 메시지를 아는 총 노드 수
      const informedCount = [...this.nodes.values()].filter((n) =>
        n.knownMessages.has(message),
      ).length;
      messageReachPerRound.push(informedCount);

      // 모든 노드가 메시지를 받았으면 종료
      if (informedCount >= totalNodes) {
        break;
      }

      // 다음 라운드의 활성 노드 = 이번에 새로 메시지를 받은 노드들
      activeNodes = nextActiveNodes;
    }

    return {
      roundsToConverge: round,
      messageReachPerRound,
    };
  }

  // 내부 메서드: 특정 노드에서 가십 전파 수행
  // broadcast와 유사하지만 이미 knownMessages에 있는 상태에서 전파
  private gossipFromNode(
    node: Node,
    message: string,
    fanout: number,
  ): Node[] {
    const candidatePeers = [...node.peers].filter(
      (peer) => !peer.knownMessages.has(message),
    );

    const selected = this.selectRandom(candidatePeers, fanout);
    const newlyInformed: Node[] = [];

    for (const peer of selected) {
      if (!peer.knownMessages.has(message)) {
        peer.knownMessages.add(message);
        newlyInformed.push(peer);
      }
    }

    return newlyInformed;
  }

  // Fisher-Yates 셔플 기반 무작위 선택
  // 배열에서 count개를 균일하게 무작위 선택
  private selectRandom<T>(array: T[], count: number): T[] {
    const shuffled = [...array];
    const limit = Math.min(count, shuffled.length);

    for (let i = 0; i < limit; i++) {
      const j = i + Math.floor(Math.random() * (shuffled.length - i));
      [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
    }

    return shuffled.slice(0, limit);
  }
}

// ============================================
// 데모: 20개 노드 네트워크에서 가십 전파
// ============================================
function demo(): void {
  const network = new GossipNetwork();

  // 1. 20개 노드 생성
  const nodeCount = 20;
  const nodes: Node[] = [];
  for (let i = 0; i < nodeCount; i++) {
    nodes.push(network.addNode(`node-${i}`));
  }

  // 2. 랜덤 메시 토폴로지 구성
  // 각 노드가 평균 4~6개의 피어를 갖도록 연결
  // 실제 비트코인 노드는 기본 8개의 아웃바운드 연결을 유지
  for (let i = 0; i < nodes.length; i++) {
    // 각 노드마다 3~5개의 랜덤 피어와 연결
    const peerCount = 3 + Math.floor(Math.random() * 3);
    for (let p = 0; p < peerCount; p++) {
      let j = Math.floor(Math.random() * nodes.length);
      // 자기 자신과의 연결 방지
      if (j === i) j = (j + 1) % nodes.length;
      network.connect(nodes[i]!, nodes[j]!);
    }
  }

  console.log("=== Gossip Protocol 시뮬레이션 ===\n");
  console.log(`노드 수: ${nodeCount}`);
  console.log(
    `평균 피어 수: ${(nodes.reduce((sum, n) => sum + n.peers.size, 0) / nodeCount).toFixed(1)}`,
  );

  // 3. 각 노드의 연결 상태 출력
  console.log("\n--- 네트워크 토폴로지 ---");
  for (const node of nodes.slice(0, 5)) {
    const peerIds = [...node.peers].map((p) => p.id).join(", ");
    console.log(`${node.id}: [${peerIds}]`);
  }
  console.log(`... (나머지 ${nodeCount - 5}개 노드 생략)\n`);

  // 4. 가십 전파 시뮬레이션
  const message = "tx:alice→bob:1.5BTC";
  const startNode = nodes[0]!;

  console.log(`--- 메시지 전파 시작 ---`);
  console.log(`메시지: "${message}"`);
  console.log(`시작 노드: ${startNode.id}`);
  console.log(`Fanout: 3 (각 노드가 3개의 랜덤 피어에게 전달)\n`);

  const result = network.simulateRounds(message, startNode, 3);

  // 5. 라운드별 전파 결과 출력
  console.log("--- 라운드별 전파 현황 ---");
  for (let i = 0; i < result.messageReachPerRound.length; i++) {
    const reach = result.messageReachPerRound[i]!;
    const percentage = ((reach / nodeCount) * 100).toFixed(1);
    // 시각적 바 그래프
    const bar = "█".repeat(Math.ceil((reach / nodeCount) * 30));
    const label = i === 0 ? "시작" : `R${i}`;
    console.log(
      `  ${label.padStart(4)}: ${String(reach).padStart(3)}/${nodeCount} (${percentage.padStart(5)}%) ${bar}`,
    );
  }

  console.log(`\n전체 도달까지 ${result.roundsToConverge} 라운드 소요`);
  console.log(
    `이론적 하한: O(log₂ ${nodeCount}) ≈ ${Math.ceil(Math.log2(nodeCount))} 라운드`,
  );

  // 6. Fanout 비교 실험
  console.log("\n\n=== Fanout에 따른 수렴 속도 비교 ===\n");

  for (const fanout of [1, 2, 3, 5, 10]) {
    // 여러 번 시뮬레이션하여 평균값 산출
    const trials = 10;
    let totalRounds = 0;

    for (let t = 0; t < trials; t++) {
      // 각 시행마다 메시지 상태 초기화
      const trialMessage = `test-fanout-${fanout}-trial-${t}`;
      const trialResult = network.simulateRounds(
        trialMessage,
        nodes[Math.floor(Math.random() * nodes.length)]!,
        fanout,
      );
      totalRounds += trialResult.roundsToConverge;
    }

    const avgRounds = (totalRounds / trials).toFixed(1);
    console.log(
      `  fanout=${String(fanout).padStart(2)}: 평균 ${avgRounds} 라운드 (${trials}회 시행)`,
    );
  }

  // 7. 노드 장애 시뮬레이션
  console.log("\n\n=== 내결함성 테스트 ===\n");

  // 20% 노드를 "장애" 상태로 (피어 연결 제거)
  const failCount = Math.floor(nodeCount * 0.2);
  const failedNodes = nodes.slice(nodeCount - failCount);
  console.log(`${failCount}개 노드 장애 발생 (20%): ${failedNodes.map((n) => n.id).join(", ")}`);

  // 장애 노드의 피어 연결 백업 후 제거
  const backups: Map<Node, Set<Node>> = new Map();
  for (const failed of failedNodes) {
    backups.set(failed, new Set(failed.peers));
    for (const peer of failed.peers) {
      peer.peers.delete(failed);
    }
    failed.peers.clear();
  }

  const failMessage = "tx:charlie→dave:0.5BTC";
  const failResult = network.simulateRounds(failMessage, nodes[0]!, 3);

  const reachable = failResult.messageReachPerRound[failResult.messageReachPerRound.length - 1]!;
  const healthyNodes = nodeCount - failCount;
  console.log(
    `메시지 도달: ${reachable}/${healthyNodes} 정상 노드 (${((reachable / healthyNodes) * 100).toFixed(1)}%)`,
  );
  console.log(`수렴까지 ${failResult.roundsToConverge} 라운드`);
  console.log("→ 노드 일부가 죽어도 나머지 노드들은 메시지를 수신할 수 있음 (내결함성)\n");

  // 연결 복원
  for (const [failed, peers] of backups) {
    for (const peer of peers) {
      network.connect(failed, peer);
    }
  }
}

// 실행
demo();

export { Node, GossipNetwork };
