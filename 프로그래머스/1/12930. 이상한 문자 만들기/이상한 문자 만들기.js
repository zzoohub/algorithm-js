function solution(s) {
    return s.split(" ").map((word) => {
        return word.split("").map((c, i) => {
            if(i % 2 === 0) return c.toUpperCase()
            return c.toLowerCase()
        }).join("")
    }).join(" ")
}