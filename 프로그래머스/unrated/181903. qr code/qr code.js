function solution(q, r, code) {
    return [...code].filter((c, i) => (i % q === r)).join("")
}