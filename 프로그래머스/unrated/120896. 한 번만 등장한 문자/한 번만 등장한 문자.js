function solution(s) {
    let obj = {}
    s.split("").forEach((x) => {
        if(obj[x]) {
            obj[x]++
        } else {
            obj[x] = 1
        }
    })
    
    return Object.entries(obj).filter(([x, i]) => i === 1).map(([x, i]) => x).sort().join("")
}