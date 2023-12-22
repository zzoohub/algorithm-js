function solution(n) {
    return Number([...String(n)].map((x) => Number(x)).sort((a, b) => b - a).join(""))
}