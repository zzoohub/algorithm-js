function solution(x) {
    const sum = String(x).split("").map((x) => Number(x)).reduce((acc, cur) => acc + cur, 0)
    if(x % sum === 0) return true
    return false
}