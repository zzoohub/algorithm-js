function solution(n) {  
    const arr = new Array(n).fill(0).map((x, i) => i + 1)
    return arr.filter((x) => n % x === 0).reduce((acc, cur) => acc + cur, 0)
}