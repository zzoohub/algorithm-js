function solution(n) {
    const MOD = 1234567    
 
    let prev2 = 0;
    let prev1 = 1;
    
    // F(2)부터 F(n)까지 순차적으로 계산
    for (let i = 2; i <= n; i++) {
        let current = (prev1 + prev2) % MOD;
        prev2 = prev1;
        prev1 = current;
    }
    
    return prev1;
}