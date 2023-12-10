function solution(my_string) {
    return [...my_string].map((x) => {
        if(x === x.toLowerCase()) return x.toUpperCase()
        return x.toLowerCase()
    }).join("")
}