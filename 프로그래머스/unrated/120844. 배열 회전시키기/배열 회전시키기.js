function solution(numbers, direction) {
    if(direction === "left") {
        numbers.push(numbers[0])
        numbers.shift()        
    } else {
        numbers.unshift(numbers.at(-1))
        numbers.pop()
    }
    return numbers    
}