function solution(changeRatio, b, initialEmpties) {
    
    let empties = initialEmpties
    let currentCola = 0;
    let totalCola = 0

    while(empties >= changeRatio) {
        const changable = Math.floor(empties / changeRatio) * b
        empties = changable + (empties % changeRatio)
        totalCola += changable      
    }
    
    return totalCola
}