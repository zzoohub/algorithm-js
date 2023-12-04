function solution(arr, flag) {
    var result = [];
    flag.forEach((x, i) => { 
        const count = arr[i]
        if (x) {
            for(let i = 0; i < count * 2; i++) {
                result.push(count)
            }
        } else {
            for(let i = 0; i < count; i++) {
                result.pop()
            }
        }
    })
    return result
}