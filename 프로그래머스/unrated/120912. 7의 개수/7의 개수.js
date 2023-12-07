function solution(array) {
    return array.map((x) => x.toString().split("")).flat().filter((x) => x === "7").length
}