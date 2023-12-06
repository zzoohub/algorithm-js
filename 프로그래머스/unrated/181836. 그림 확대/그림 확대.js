function solution(picture, k) {
    let result = []
    const words = picture.map((x) => {
        return [...x].map((x) => {
            let word = ""
            for(let i = 0; i < k; i++) {
                word += x
            }
            return word
        }).join("")
    })
    
    words.forEach((x) => {
        let i = k
        while(i) {
            result.push(x)
            i--
        }        
    })
    return result
}