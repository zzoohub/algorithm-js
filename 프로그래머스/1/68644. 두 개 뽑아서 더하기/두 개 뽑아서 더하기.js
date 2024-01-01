function solution(numbers) {
    let result = []
    for(let i = 0; i < numbers.length; i++) {
        const x = numbers[i]
        for(let j = 0; j < numbers.length; j++) {
            const y = numbers[j]
            if(i === j) continue
            result.push(x + y)
        }
    }
    return [...new Set(result)].sort((a, b) => a - b)
}