function solution(nums) {
    const isPrime = (n) => {
        for(let i = 2; i <= Math.sqrt(n); i++) {
            if(n % i === 0) return false
        }
        return true
    }
    
    
    let results = []
    
    const combi3 = (current, remains) => {
        if(current.length === 3) {            
            return results.push(current)
        }
        
        for(let i = 0; i < remains.length; i++) {
            const clonedCurrent = [...current]            
            clonedCurrent.push(remains[i])            
            const clonedRemains = remains.slice(i + 1)
            combi3(clonedCurrent, clonedRemains)
        }
    }
    
    combi3([], nums)        
    
    const sums = results.map((x) => x.reduce((acc, cur) => acc + cur, 0))
    
    return sums.reduce((acc, cur) => {
        if(isPrime(cur)) {
            acc += 1            
        }
        return acc
    }, 0)
}