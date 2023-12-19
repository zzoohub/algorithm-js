function solution(n, k) {
    let a = 12000
    let b = 2000
    
    return (n * a) + (b * k) - (Math.floor(n / 10) * b)
}