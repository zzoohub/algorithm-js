function solution(num_list, n) {
    return num_list.reduce((acc, cur, i) => (i % n === 0) ? [...acc, cur] : acc, [])
}