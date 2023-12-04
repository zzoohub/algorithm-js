function solution(myString, pat) {
    for(let s = myString.length; s !== 0; s--) {
        const parts = [...myString].slice(0, s).join("")
        if(parts.endsWith(pat)) return parts
    }
    return ""
}