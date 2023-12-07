function solution(num, total) {
    let result = []
    const mid = total / num
    let start = Number.isInteger(mid) ? Math.floor(mid - Math.floor(num / 2)) : Math.floor(mid - Math.floor(num / 2)) + 1
    for(let i = start; i < start + num; i++) {
        result.push(i)   
    }    
    return result
}