function solution(a, b) {
    let inner = 0
    
    a.forEach((x, i) => {
       inner += (x * b[i])
    })
    return inner
}