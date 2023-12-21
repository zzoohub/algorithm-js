function gcd(a, b) { 
    if(a % b === 0) return b
    return gcd(b, a % b)
}

function lcm(a, b) {
    const gcdValue = gcd(a, b)
    return (a * b) / gcdValue
}

function solution(numer1, denom1, numer2, denom2) {
    const lcmDenominator = lcm(denom1, denom2)
        
    const num1 = numer1 * (lcmDenominator / denom1)
    const num2 = numer2 * (lcmDenominator / denom2)
    
    const sumNumerator = num1 + num2
    
    const gcdValue = gcd(sumNumerator, lcmDenominator)
    
    return [sumNumerator / gcdValue, lcmDenominator / gcdValue]
}