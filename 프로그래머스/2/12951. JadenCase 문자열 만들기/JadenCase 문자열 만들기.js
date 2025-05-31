function solution(s) {
    const words = s.split(" ")
    
    const transformed =  words.map((word) => {
        const start = word.slice(0, 1)
        const remainder = word.slice(1)
        return start.toUpperCase() + remainder.toLowerCase()
    })
    
    return transformed.join(" ")
}