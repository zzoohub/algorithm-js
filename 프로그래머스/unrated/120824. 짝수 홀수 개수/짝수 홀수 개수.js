function solution(num_list) {
    let count = [0, 0]
    num_list.forEach((x) => {
        if(x % 2 === 1) {
            return count[1]++            
        }
        count[0]++
    })
    return count
}