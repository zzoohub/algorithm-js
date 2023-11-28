function solution(arr, intervals) {
    const [a1, a2] = intervals
    return arr.slice(a1[0], a1[1] + 1).concat(arr.slice(a2[0], a2[1] + 1))
}