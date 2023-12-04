function solution(arr) {
    let result = []
    arr.forEach((x) => {
        for(let i = 0; i < x; i++) {
            result.push(x)
        }
    })
    return result
}