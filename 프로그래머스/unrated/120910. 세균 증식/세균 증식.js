function solution(n, t) {
    const count = (x) => {
        t--
        if(t !== 0) return count(x * 2)        
        if(t === 0) return x * 2
    }
    return count(n)
}