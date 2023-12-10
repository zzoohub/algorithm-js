function solution(array) {
    const result = []
    const max = Math.max(...array)
    result.push(max)
    result.push(array.findIndex((x) => x === max))
    return result
}