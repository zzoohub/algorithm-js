function solution(n, m) {
    const gcd = GCD(n, m)
    const lcm = (n * m) / gcd    
    return [gcd, lcm]
}

function GCD(a, b) {
    if(a % b === 0) return b
    return GCD(b, a % b)
}