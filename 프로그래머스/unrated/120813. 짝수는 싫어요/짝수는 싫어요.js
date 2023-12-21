function solution(n) {
    let result = []
    while(n) {
        if(n % 2 === 1) result.push(n)
        n--
    }
    return result.sort((a, b) => a - b)
}