function solution(array, commands) {
    return commands.map(([i, j, k]) => {
        const sliced = array.slice(i - 1, j)
        console.log(sliced)
        const sorted = sliced.sort((a, b) => a - b)
        console.log(sorted)
        return sorted[k - 1]
    })
}