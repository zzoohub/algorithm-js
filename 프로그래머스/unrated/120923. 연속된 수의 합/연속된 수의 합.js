function solution(num, total) {
    const start = (total / num) - (num / 2) + (1 / 2)    
    let result = []
    for(let i = start; i < start + num; i++) {
        result.push(i)
    }
    return result
}