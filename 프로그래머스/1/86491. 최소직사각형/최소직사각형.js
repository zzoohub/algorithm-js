function solution(sizes) {
    const sorted = sizes.map((x) => x.sort((a, b) => b - a))
    
    const max = sorted.reduce((acc, cur) => {
        const horizen = Math.max(acc[0], cur[0])
        const vertical = Math.max(acc[1], cur[1])
        return [horizen, vertical]
    }, [0, 0])

    
    return max[0] * max[1]
}