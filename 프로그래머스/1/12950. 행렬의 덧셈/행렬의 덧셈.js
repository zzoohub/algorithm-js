function solution(arr1, arr2) {
    let result = []
    arr1.forEach((row, ri) => {
        let sum = []
        row.forEach((col, ci) => {
            sum.push(col + arr2[ri][ci]) 
        })
        result.push(sum)
    })
    return result
}