function solution(myString) {
    return [...myString].map((x) => {
        if(x === "a") return "A"
        if(x !== "A" || x.charCodeAt() >= 97) return x.toLowerCase()
        return x
    }).join('')
}