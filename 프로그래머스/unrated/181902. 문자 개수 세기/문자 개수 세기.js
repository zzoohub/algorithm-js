function solution(my_string) {
    let result = new Array(52).fill(0)
    
    Array.from(my_string).forEach((c, i) => {
        const code = c.charCodeAt(0)    
        if("Z" < c) {
            const a = "a".charCodeAt(0) 
            result[code - a + 26]++
        } else {
            const A = "A".charCodeAt(0) 
            result[code - A]++
        }       
    })
    return result
}