function solution(absolutes, signs) {
    return absolutes.map((x, i) => {
        if(signs[i]) return x
        return -x
    }).reduce((acc, cur) => acc + cur, 0)
}