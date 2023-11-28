function solution(my_string, indices) {
    return Array.from(my_string).filter((c, i) => !indices.includes(i)).join("")
}