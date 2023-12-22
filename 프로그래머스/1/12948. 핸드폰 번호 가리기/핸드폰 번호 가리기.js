function solution(phone_number) {
    const four = phone_number.slice(-4)
    return "*".repeat(phone_number.length - 4) + four
}