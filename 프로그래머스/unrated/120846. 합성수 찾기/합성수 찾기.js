function solution(n) {
    let result = 0;
    for(let i = 2; i <= n; i++) {
        if(isComposite(i)) result++
    }
    return result
}

function isComposite(n) {
    if(n === 1) return false
    for(let i = 2; i < n; i++) {
        if(n % i === 0) return true
    }
    return false
}