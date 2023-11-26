function solution(number) {
    return String(number).split("").reduce((acc, cur) => Number(cur) + acc ,0) % 9
}