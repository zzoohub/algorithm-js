function solution(s, n) {
    const unicoded = [...s].map((x) => x.charCodeAt(0))

    const stringify = unicoded.map((x) => {
        if(x === 32) return " "
        return String.fromCharCode(transform(x, n)) 
    })
    return stringify.join("")
}

function transform(x, n) {
    if(x >= 65 && x <= 90) {
        if(x + n > 90) return (x + n - 1 - 90) + 65
        return x + n
    }
    if(x >= 97 && x <= 122) {
        if(x + n > 122) return (x + n - 1 - 122) + 97
        return x + n
    }
}