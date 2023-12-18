function solution(my_string) {
    return [...my_string].filter((x) => !isNaN(x)).reduce((acc, cur) => acc + Number(cur), 0)
}