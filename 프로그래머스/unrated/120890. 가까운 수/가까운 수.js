function solution(array, n) {
    return array.reduce((acc, cur) => {
        const diff = Math.abs(acc - n)
        const newDiff = Math.abs(cur - n)
        if(diff < newDiff) return acc
        if(diff === newDiff) {
            if(cur < acc) return cur
            return acc
        }
        if(diff > newDiff) return cur
    }, array[0])
}