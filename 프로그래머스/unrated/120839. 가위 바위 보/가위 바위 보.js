function solution(rsp) {
    return [...rsp].map((x) => transform(x)).join("")
}

function transform(x) {
    if(x === '2') return "0"
    if(x === '0') return "5"
    if(x === '5') return "2"
}