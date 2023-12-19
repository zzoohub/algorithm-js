function solution(emergency) {
    const sorted = [...emergency].sort((a, b) => b - a)
    return emergency.map((x, i) => {
        return sorted.indexOf(x) + 1
    })
}