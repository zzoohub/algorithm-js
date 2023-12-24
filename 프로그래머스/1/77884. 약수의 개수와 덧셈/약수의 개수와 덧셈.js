function solution(left, right) {
    let result = 0;
    for(let i = left; i <= right; i++) {
        if(countDivisor(i) % 2 === 0) {
            result += i
        } else {
            result -= i
        }
    }
    return result
}

function countDivisor(n) {
    const nums = new Array(n).fill(0).map((x, i) => i + 1)    
    const count = nums.filter((x, i) => {
        if(n % x === 0) return true
        else return false
    }).length
    console.log(count)
    return count
}