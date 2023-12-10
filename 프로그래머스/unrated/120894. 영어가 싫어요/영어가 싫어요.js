function solution(numbers) {
    const arr = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"]
    arr.forEach((test, i) => {
         numbers = numbers.replaceAll(test, i)
    })
    return Number(numbers)
}