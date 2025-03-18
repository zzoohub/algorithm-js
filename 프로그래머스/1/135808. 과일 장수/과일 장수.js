function solution(k, m, scores) {
    
    const sorted = scores.sort((a, b) => b - a)
    
    let score = 0
    let box = []
    for(let i = 0; i < sorted.length; i++) {
        const value = sorted[i]
        box.push(value)
        if(box.length === m) {
            const min = Math.min(...box)
            score += min * m
            box = []
        }
    }
    
    return score
}