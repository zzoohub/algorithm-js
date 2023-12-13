function solution(numlist, n) {
    return numlist.sort((a, b) => {
        if(Math.abs(n - a) === Math.abs(n - b)) return b - a
        return Math.abs(n - a) - Math.abs(n - b)
    })
}