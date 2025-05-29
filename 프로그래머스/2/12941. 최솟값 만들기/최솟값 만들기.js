function solution(A,B){
    const one = A.sort((a, b) => a - b)
    const two = B.sort((a, b) => b - a)

    let acc = 0;
    for(let i = 0; i < one.length; i++) {
        acc += one[i] * two[i]        
    }
    
    return acc;
}