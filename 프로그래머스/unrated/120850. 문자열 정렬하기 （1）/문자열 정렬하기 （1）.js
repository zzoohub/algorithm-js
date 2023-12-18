function solution(my_string) {
    return [...my_string].filter((x) => !isNaN(x)).map((x) => Number(x)).sort((a, b) => a - b)
}