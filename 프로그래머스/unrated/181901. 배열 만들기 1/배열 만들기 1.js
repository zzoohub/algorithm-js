function solution(n, k) {
    return new Array(n).fill(0).map((x, i) => i + 1).filter(n => n % k === 0)
}