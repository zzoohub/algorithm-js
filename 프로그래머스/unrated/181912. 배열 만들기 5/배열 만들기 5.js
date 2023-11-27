function solution(intStrs, k, s, l) {
    return intStrs.map((str) => str.slice(s, s + l))
    .map((str) => Number(str))
    .filter((n) => n > k)
}