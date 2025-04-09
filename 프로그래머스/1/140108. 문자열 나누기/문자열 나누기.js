function solution(str) {
    let result = 0;
    
    let target = "";    
    
    let targetCount = 0;
    let nonTargetCount = 0;
    for(let i = 0; i < str.length; i++) {
        if(i === str.length - 1) {
            result += 1
            continue
        }
        const s = str[i]
        if(!target) {
            target = s;
            targetCount += 1;            
            continue
        }
        
        if(s === target) {            
            targetCount += 1;            
        } else {
            nonTargetCount += 1;
        }
        
        if(targetCount === nonTargetCount) {
            target = "";
            targetCount = 0;
            nonTargetCount = 0;
            result += 1           
        }
    }
    
    return result
}