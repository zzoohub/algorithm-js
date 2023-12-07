function solution(my_str, n) {
    let result = []
    
    for(let i = 0; i < Math.ceil(my_str.length / n); i++) {
        result.push(my_str.slice(i * n, i * n + n))
    }
    return result
}