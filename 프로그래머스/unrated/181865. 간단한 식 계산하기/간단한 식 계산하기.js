function solution(binomial) {
    const [x, op, y] = binomial.split(" ").map((x, i) => {
        if(i === 1) return x
        return parseInt(x)
    })
    if(op === "+") return x + y
    if(op === "-") return x - y
    return x * y
}