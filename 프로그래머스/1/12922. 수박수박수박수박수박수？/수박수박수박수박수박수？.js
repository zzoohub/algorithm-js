function solution(n) {
    return new Array(n).fill(0).map((x, i) => {
        if(i % 2 === 0) return "수"
        return "박"
    }).join("")
}