function solution(order) {
    return [...order.toString()].filter((x) => x !== "0").reduce((acc, cur) => {
        if(Number(cur) % 3 === 0) return acc + 1
        return acc
    }, 0)
}