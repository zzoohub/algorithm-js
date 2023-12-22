function solution(a, b) {
    const [x, y] = [a, b].sort((d, f) => d - f)
    let result = 0    
    for(let i = x; i <= y; i++) {
        result += i
    }
    return result
}