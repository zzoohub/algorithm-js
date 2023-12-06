function solution(myString) {
    return [...myString].map((x) => {
        if(x.charCodeAt() < "l".charCodeAt()) return "l"
        return x
    }).join('')
}