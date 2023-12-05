function solution(arr1, arr2) {
    if(arr1.length !== arr2.length) {
        return arr1.length > arr2.length ? 1 : -1
    }
    const sum_arr1 = arr1.reduce((acc, cur) => acc + cur, 0)
    const sum_arr2 = arr2.reduce((acc, cur) => acc + cur, 0)
    if(sum_arr1 === sum_arr2) return 0
    return sum_arr1 > sum_arr2 ? 1 : -1
}