function solution(X, Y) {    
    const xCount = new Array(10).fill(0)
    const yCount = new Array(10).fill(0)
    
    for(let char of X) {
        xCount[parseInt(char)]++
    }
    for(let char of Y) {
        yCount[parseInt(char)]++
    }
    
    const nums = []
    for(let i = 0; i <= 9; i++) {
        const commonCount = Math.min(xCount[i], yCount[i])        
        for(let j = 0; j < commonCount; j++) {            
            nums.push(i)
        }
    }
    
    const result = nums.sort((a, b) => b - a).join("")
    
    if(result.length === 0) return "-1"
    if(Number(result) === 0) return "0"
    
    return result
}