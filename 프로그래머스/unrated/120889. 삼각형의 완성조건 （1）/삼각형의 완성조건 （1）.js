function solution(sides) {
    const sorted = sides.sort()
    return sorted[0] + sorted[1] > sorted[2] ? 1 : 2
}