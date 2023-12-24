function solution(s) {
    if(!(s.length === 4 || s.length === 6)) return false
    for(let a of [...s]) {
        if(!Number.isInteger(Number(a))) return false
    }
    return true
}