function solution(score) {
    // 각 학생의 평균 점수와 원래 인덱스를 포함한 배열을 생성
    const averages = score.map(([english, math], index) => {
        return { index: index, average: (english + math) / 2 };
    });

    // 평균 점수를 기준으로 정렬
    averages.sort((a, b) => b.average - a.average);

    // 등수 매기기
    const ranks = new Array(score.length).fill(0);
    let rank = 1;
    for (let i = 0; i < averages.length; i++) {
        // 이전 학생과 평균 점수가 같으면 같은 등수 부여
        if (i > 0 && averages[i].average === averages[i - 1].average) {
            ranks[averages[i].index] = ranks[averages[i - 1].index];
        } else {
            ranks[averages[i].index] = rank;
        }
        rank++;
    }

    return ranks;
}