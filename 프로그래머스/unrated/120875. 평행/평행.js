
const slope = ([x1, y1], [x2, y2]) => {
    return (y1 - y2) / (x1 - x2)
}

const plusTwo = (n) => {
    return (n + 2) % 4
}
const next = (n) => {
    return (n + 1) % 4
}

let count = 0
function solution(dots) {
    while(count !== 4) {
        const one = slope(dots[count], dots[next(count)])
        const two = slope(dots[plusTwo(count)], dots[plusTwo(count + 1)])
        if(one === two) return 1
        count++
    }
    return 0
}