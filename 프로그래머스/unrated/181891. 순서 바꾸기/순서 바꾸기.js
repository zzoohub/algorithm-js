function solution(num_list, n) {
    const front = num_list.slice(0, n)
    const back = num_list.slice(n)
    return [...back, ...front]
}