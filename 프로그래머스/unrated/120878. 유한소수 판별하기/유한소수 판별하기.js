function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

function solution(a, b) {
    // a와 b의 최대공약수로 각각을 나누어 기약분수 형태로 만든다.
    const greatestCommonDivisor = gcd(a, b);
    a /= greatestCommonDivisor;
    b /= greatestCommonDivisor;

    // b를 2와 5의 소인수로만 나누어 떨어지는지 확인
    while (b % 2 === 0) b /= 2;
    while (b % 5 === 0) b /= 5;

    // 나눈 결과가 1이면 유한소수, 그렇지 않으면 무한소수
    return b === 1 ? 1 : 2;
}