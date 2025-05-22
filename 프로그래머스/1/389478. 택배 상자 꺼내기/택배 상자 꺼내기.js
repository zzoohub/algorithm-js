function solution(n, w, num) {
    const map = {}
        
    let targetColumn = 0;
    for(let i = 1; i <= n; i ++) {        
        let column = i % w === 0 ? w : i % w
        const row = Math.ceil(i / w)
        if (!map[column]) {
            map[column] = [];
        }
                
        if(row % 2 === 0) {
            column = w - column + 1            
        } 
        if(i === num) {
            targetColumn = column
        }
        map[column].push(i);    
    }    
    
    const index = map[targetColumn].reverse().indexOf(num)
    return index + 1
}