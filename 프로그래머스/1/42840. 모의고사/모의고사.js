function solution(answers) {
    const one = [1, 2, 3, 4, 5]
    const two = [2, 1, 2, 3, 2, 4, 2, 5]
    const three = [3, 3, 1, 1, 2, 2, 4, 4, 5, 5]
    
    const getLoopedValue = (arr, count) => {
        const length = arr.length                   
        if(count < length) return arr[count]
        return arr[count % length]
    }
        
    
    const result = {
        1: 0,
        2: 0,
        3: 0
    }
    
    for(let i = 0; i < answers.length; i++) {
        const answer = answers[i]                
        
        const scoreOne = getLoopedValue(one, i)
        if(scoreOne === answer) result['1']++
        
        const scoreTwo = getLoopedValue(two, i)
        if(scoreTwo === answer) result['2']++
        
        const scoreThree = getLoopedValue(three, i)
        if(scoreThree === answer) result['3']++
    }        
    const max = Math.max(...Object.values(result))
    console.log("max: ", max)
    return Object.entries(result).filter(([key, value]) => value === max).map(([key, value]) => Number(key)).sort((a, b) => a - b)
}