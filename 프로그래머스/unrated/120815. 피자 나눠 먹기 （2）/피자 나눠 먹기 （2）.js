function solution(n) {
    let pizza = 0;
    while (true) {
        pizza += 1 
        if((pizza * 6) % n === 0) break
    }
    return pizza
}