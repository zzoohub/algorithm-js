function solution(word) {
    return [...word].map((char, i) => calculate(word, i))
}

function calculate(word, i) {    
    const sliced = [...word.slice(0, i)].reverse()        
    const index = sliced.indexOf(word[i])     
    return index === -1 ? index : index + 1
}