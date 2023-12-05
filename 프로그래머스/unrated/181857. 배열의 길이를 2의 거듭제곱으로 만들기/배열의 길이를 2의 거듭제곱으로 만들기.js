function solution(arr) {
    let x = 1;
    while(x !== arr.length) {
        if(x === arr.length) return
        if(x < arr.length) {
            x *= 2
            continue
        }
        if(x > arr.length) {
            arr.push(0)
        }
    }
    return arr
}