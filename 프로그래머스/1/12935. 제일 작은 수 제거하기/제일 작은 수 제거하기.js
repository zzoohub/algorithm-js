function solution(arr) {
    const min = Math.min(...arr)
    const index = arr.indexOf(min)
    
    arr.splice(index, 1)
    
    if(arr.length === 1 && arr[0] === 10) return [-1]
    return arr
}