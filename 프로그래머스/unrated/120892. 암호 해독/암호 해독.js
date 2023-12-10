function solution(cipher, code) {
    return [...cipher].filter((x, i) => (i + 1) % code === 0).join("")
}