function solution(arr, divisor) {
    const filtered = arr.filter((x) => (x % divisor) === 0).sort((a, b) => a - b)
    if(filtered.length === 0) return [-1]
    return filtered
}