function solution(d, budget) {
    const sorted = d.sort((a, b) => a - b)
    
    let total = 0;
    let count = 0;
    for(let amount of sorted) {
        if(total + amount > budget) return count
        total += amount
        count += 1
    }
    
    return count
}