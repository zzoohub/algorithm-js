function solution(n) {
    let index = n
    let result = []
    while(index) {
        const arr = new Array(n).fill(0).map((x, i) => i + 1 === index ? 1 : 0)
        result.push(arr)
        index--
    }
    return result.reverse()
}
