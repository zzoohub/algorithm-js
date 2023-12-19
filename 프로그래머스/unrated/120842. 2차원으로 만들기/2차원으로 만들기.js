function solution(num_list, n) {
    let result = []
    let temp;
    for(let i = 0; i < num_list.length; i++) {
        if(i === num_list.length - 1) {
            temp.push(num_list[i])
            result.push(temp)
            break
        }
        if(i % n === 0) {
            if(Array.isArray(temp)) result.push(temp)
            temp = [num_list[i]]
        } else {
            temp.push(num_list[i])
        }
    }
    return result
}