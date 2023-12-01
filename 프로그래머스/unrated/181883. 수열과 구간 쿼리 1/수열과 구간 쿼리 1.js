function solution(arr, queries) {
    queries.forEach(([s, e], idx) => {
        for(let i = s; i <= e; i++) {
            arr[i]++
        }
    })
    return arr
}