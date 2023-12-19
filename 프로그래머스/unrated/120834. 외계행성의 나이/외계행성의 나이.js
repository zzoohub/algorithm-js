function solution(age) {    
    let s = 97
    return [...age.toString()].map((x) => String.fromCharCode(Number(x) + s)).join("")
    
}