

function solution(board) {
    const isSideFuck = (row, ni) => {
        if(row[ni - 1] === 1 || row[ni + 1] === 1 || row[ni] === 1) return true
        return false
    }
    
    const isFuck = (ri, ni) => {        
        const prevRow = board[ri - 1]
        const curRow = board[ri]
        const nextRow = board[ri + 1]
        let flag = false;
        if(prevRow) {
            flag = isSideFuck(prevRow, ni)
        }
        if(curRow && flag === false) {
            flag = isSideFuck(curRow, ni)
        }
        if(nextRow && flag === false) {
            flag = isSideFuck(nextRow, ni)
        }
        return flag
    }
    let count = 0;
    for(let ri = 0; ri < board.length; ri++) {
        const row = board[ri]
        for(let ni = 0; ni < row.length; ni++) {
            const node = row[ni]            
            if(!isFuck(ri, ni)) count++            
        }
    }
    return count
}