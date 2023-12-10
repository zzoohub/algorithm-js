function solution(my_string, num1, num2) {
    const one = my_string.at(num1)
    const two = my_string.at(num2)
    const arr = my_string.split("")
    arr[num1] = two
    arr[num2] = one
    return arr.join("")
}