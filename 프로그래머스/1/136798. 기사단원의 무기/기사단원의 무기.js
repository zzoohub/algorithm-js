function solution(number, limit, power) {            
    const divisor = (n) => {
        let count = 0
        for(let i = 1; i <= Math.sqrt(n); i++) {
            if(i * i === n) {
                count += 1
                continue
            }
            if(n % i === 0) count += 2
        }
        return count
    }
    
    let result = 0;
    for(let i = 1; i <= number; i++) {
        const score = divisor(i)
        if(score <= limit) {
            result += score
        } else {
            result += power
        }
    }
    return result
}