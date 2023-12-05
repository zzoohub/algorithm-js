function solution(strArr) {
    const lengthMap = new Map();

    // 문자열의 길이를 기준으로 그룹화
    strArr.forEach(str => {
        const length = str.length;
        lengthMap.set(length, (lengthMap.get(length) || 0) + 1);
    });

    // 가장 큰 그룹의 크기 찾기
    let maxGroupSize = 0;
    for (let [length, count] of lengthMap) {
        if (count > maxGroupSize) {
            maxGroupSize = count;
        }
    }

    return maxGroupSize;
}