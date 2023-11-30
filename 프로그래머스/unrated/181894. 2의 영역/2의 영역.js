function solution(arr) {
    if(!arr.includes(2)) return [-1]
    const indexes = []
    arr.forEach((x, i) => {x === 2 && indexes.push(i)})
    if(indexes.length > 1) return arr.slice(indexes[0], indexes.at(-1) + 1)
    return [2]
}