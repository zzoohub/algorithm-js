function solution(n) {
    const primeNums = new Array(n + 1).fill(true); // n+1 크기의 배열을 true로 초기화
    primeNums[0] = primeNums[1] = false      
        
            
    for(let i = 2; i <= Math.sqrt(n); i++) {
        if(primeNums[i]) {           
            for (let j = i * i; j <= n; j += i) {
                primeNums[j] = false
            }
        }
    }    
    
    return primeNums.reduce((acc, cur) => {
        if(cur) {
            acc += 1
        }
        return acc
    }, 0)
}