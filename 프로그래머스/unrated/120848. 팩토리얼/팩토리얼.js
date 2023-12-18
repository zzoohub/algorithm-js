function solution(n) {
    let i = 0;    
    let total = 1;
    while(total * (i + 1) <= n) {                             
        i++
        total *= i        
    }
    return i
}