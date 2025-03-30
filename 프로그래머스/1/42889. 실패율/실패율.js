function solution(N, stages) {
    
    const failRateMap = new Map(Array.from({length: N}).map((x, i) => [i + 1, 0]))
            
    new Array(N).fill(0).map((_, i) => i + 1).forEach((stage) => {
        const challengers = stages.filter(x => x >= stage)
        const fails = stages.filter(x => x === stage)
        
        if(challengers.length !== 0) {
            failRateMap.set(stage, fails.length / challengers.length)
        }
    })            
    
    return Array.from(failRateMap).sort((a, b) => b[1] - a[1]).map((x) => x[0])
}