function solution(strArr) {
    return strArr.map((x, i) => {
        if(i % 2 === 0) return x.toLowerCase()
        return x.toUpperCase()
    })
}