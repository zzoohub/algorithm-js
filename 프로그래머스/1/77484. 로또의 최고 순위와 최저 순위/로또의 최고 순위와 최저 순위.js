function solution(lottos, win_nums) {
    const awardsMap = {
        0: 6,
        1: 6,
        2: 5,
        3: 4,
        4: 3,
        5: 2,
        6: 1,        
    }
    
    let result = [0, 0]
    for(let i = 0; i < win_nums.length; i++) {
        const num = win_nums[i]
        if(lottos.includes(num)) {
            result[0] += 1
            result[1] += 1
        } 
    }
    result[0] += lottos.reduce((acc, cur) => {
        if(cur === 0) acc += 1
        return acc
    }, 0)
    return result.map(x => awardsMap[x])
}