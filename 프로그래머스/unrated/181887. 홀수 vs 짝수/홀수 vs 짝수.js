function solution(num_list) {
    let a = num_list.reduce((acc, cur, i) => i % 2 === 0 ? acc + cur : acc, 0)
    let b = num_list.reduce((acc, cur, i) => i % 2 === 1 ? acc + cur : acc, 0)
    
    return Math.max(a, b)
}