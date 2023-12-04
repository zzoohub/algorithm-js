function solution(num_list) {
    let count = 0
    
    const maker = (n) => {
        if(n === 1) return n
        count += 1
        if(n % 2 === 0) maker(n / 2)
        if(n % 2 === 1) maker((n - 1) / 2)
    }
    
    num_list.forEach((x) => maker(x))
    return count
}