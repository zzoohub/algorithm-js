function solution(park, routes) {
    const width = park[0].length;
    const height = park.length;

    let position = [0, 0]; // 로봇의 현재 위치 (전역으로 사용되며 move 함수에서 업데이트)
    const blocks = []; // 장애물('X') 위치 저장

    // 시작 위치 'S'와 장애물 'X' 위치 찾기
    for (let i = 0; i < park.length; i++) {
        const row = park[i];
        for (let j = 0; j < row.length; j++) {
            if (row[j] === "S") {
                position = [i, j];
            }
            if (row[j] === "X") {
                blocks.push([i, j]);
            }
        }
    }

    const isSame = (x, y) => x[0] === y[0] && x[1] === y[1];

    /**
     * 로봇을 이동시키는 재귀 함수
     * @param {string} direction - 이동 방향 ("N", "S", "W", "E")
     * @param {number} distance - 남은 이동 거리 (재귀 호출 시마다 1씩 감소)
     * @param {number[]} current - 현재 경로상 로봇이 도달한 (또는 하려는) 위치 [row, col]
     */
    const move = (direction, distance, current) => {
        // --- 최소한의 수정 시작 ---

        // 1. 현재 위치(current)가 공원 경계를 벗어나는지 확인 (가장 먼저 수행)
        //    이것은 경로의 각 단계마다 해당 셀이 유효한지 검사합니다.
        if (current[0] < 0 || current[0] >= height || current[1] < 0 || current[1] >= width) {
            return; // 경계를 벗어나면 해당 명령 무효화 (더 이상 진행하지 않음)
        }

        // 2. 현재 위치(current)에 장애물이 있는지 확인
        //    (S 위치는 장애물이 아님. blocks 배열에는 'X'만 포함되므로 S는 여기에 걸리지 않음)
        if (blocks.some(x => isSame(x, current))) {
            return; // 장애물을 만나면 해당 명령 무효화
        }

        // --- 최소한의 수정 끝 ---

        // 모든 이동을 성공적으로 마친 경우 (distance가 0이 되면)
        // current는 최종 목적지를 나타내며, 이 위치는 위의 검사들을 통과했음.
        if (distance === 0) {
            position = current; // 로봇의 전역 위치를 최종 목적지로 업데이트
            return;
        }

        // --- 기존의 잘못된 경계 확인 로직 제거 ---
        // 아래 4줄은 잘못된 로직이었으므로 삭제합니다.
        // if(direction === "N" && position[1] - distance < 0) return
        // if(direction === "S" && position[1] + distance > height) return
        // if(direction === "W" && position[0] - distance < width) return
        // if(direction === "E" && position[0] + distance > width) return
        // --- 제거 끝 ---

        // 다음 이동할 위치 계산
        let nextCell;
        switch (direction) {
            case "N":
                nextCell = [current[0] - 1, current[1]];
                break;
            case "S":
                nextCell = [current[0] + 1, current[1]];
                break;
            case "W":
                nextCell = [current[0], current[1] - 1];
                break;
            case "E":
                nextCell = [current[0], current[1] + 1];
                break;
            default: // 혹시 모를 예외 처리
                return;
        }
        // 다음 단계로 재귀 호출 (남은 거리 1 감소, 다음 예상 위치 전달)
        move(direction, distance - 1, nextCell);
    };

    // 모든 경로(routes)에 대해 순차적으로 명령 수행
    for (let i = 0; i < routes.length; i++) {
        const [direction, distanceStr] = routes[i].split(" ");
        const distanceToMove = Number(distanceStr);

        // move 함수 호출 전 로봇의 위치를 임시 저장할 필요는 없습니다.
        // move 함수가 경로 중 실패하면 전역 position이 업데이트되지 않기 때문입니다.
        // 첫 번째 current 값으로 현재 로봇의 위치(position)를 전달합니다.
        // distanceToMove는 총 이동해야 할 횟수입니다.
        move(direction, distanceToMove, position);
    }

    return position; // 모든 명령 수행 후 로봇의 최종 위치 반환
}