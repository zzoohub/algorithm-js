function solution(price, money, count) {
    const remainder = total(price, count) - money
    if(remainder <= 0) return 0
    return remainder
}

function total(price, count) {
    let amount = 0
    while(count) {
        amount += (price * count)
        count--
    }
    return amount
}