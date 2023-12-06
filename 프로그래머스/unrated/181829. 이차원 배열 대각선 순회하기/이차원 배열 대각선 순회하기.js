function solution(board, k) {
    let answer = 0
    board.forEach((x, i) => {
        x.forEach((y, j) => {
            if(i + j <= k) answer += y
        })
    })
    return answer
}