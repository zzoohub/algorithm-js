function solution(l, r) {
    function generateNumbers(n) {
        if (n === 0) {
            return [''];
        }
        const subNumbers = generateNumbers(n - 1);
        return subNumbers.map(num => num + '0').concat(subNumbers.map(num => num + '5'));
    }

    // l과 r 사이의 범위에 맞는 숫자를 찾습니다.
    const validNumbers = generateNumbers(String(r).length)
        .map(num => parseInt(num, 10))
        .filter(num => num >= l && num <= r);

    // 유효한 숫자가 없으면 -1을 반환합니다.
    return validNumbers.length ? validNumbers.sort((a, b) => a - b) : [-1];
}