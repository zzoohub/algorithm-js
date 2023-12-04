function solution(myString, pat) {
    const f = [...myString].map((x) => {
        if(x === "A") return "B"
        if(x === "B" ) return "A"
    }).join("")
    
    return f.includes(pat) ? 1 : 0
}