function solution(board, moves) {
    const arr = Array.from({ length: board.length }, () => []);
    const stack = []
    let result = 0;
    
    board.reverse().forEach((row, i) => {        
        row.forEach((x, j) => {            
            if(x !== 0) {
                arr[j].push(x)
            }
        })
    })    

    
    moves.forEach((x) => {
        const column = arr[x - 1]      
        const value = column[column.length - 1]
        if(column.length > 0) {
            if(value === stack[stack.length - 1]) {
                stack.pop()                
                result += 2
            } else {
                stack.push(value)                
            }   
            arr[x - 1].pop()
        }        
    })
    
    return result
}