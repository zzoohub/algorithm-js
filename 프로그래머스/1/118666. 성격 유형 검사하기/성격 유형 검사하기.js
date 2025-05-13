function solution(survey, choices) {        
    const entries = survey.map(x => x.split(""))        
    
    const pointMap = {
        "R": 0,
        "T": 0,
        "C": 0,
        "F": 0,
        "J": 0,
        "M": 0,
        "A": 0,
        "N": 0,
    }
    
    for(let i = 0; i < choices.length; i++) {
        const [x, y] = survey[i]
        const point = choices[i];
        if(point > 4) {
            pointMap[y] += point - 4
        } else if(point < 4) {
            pointMap[x] += 4 - point
        } 
    }
    const results = Object.entries(pointMap)    
    let result = ""
    for(let i = 0; i < results.length; i++) {
        if(i % 2 === 1) {
            const x = results[i - 1][1]
            const y = results[i][1]
            if(x >= y) {
                result += results[i - 1][0]
            } else if(x < y) {
                result += results[i][0]
            }
        }
    }
    return result
}