function solution(num, k) {
    const answer = String(num).indexOf(String(k))
    if(answer === -1) return -1
    return answer + 1
}