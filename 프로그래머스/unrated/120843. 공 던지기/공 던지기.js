function solution(numbers, k) {
    // k번째로 공을 던질 때의 배열 인덱스 계산
    const index = ((k - 1) * 2) % numbers.length;
    // 해당 인덱스의 번호 반환
    return numbers[index];
}
