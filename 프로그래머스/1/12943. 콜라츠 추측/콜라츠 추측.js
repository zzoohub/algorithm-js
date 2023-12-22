

function solution(num) {
   let count = -1;
    
    function work(n) {
        if(count >= 500) return
        count++
        if(n === 1) return
        if(n % 2 === 0) return work(n / 2)
        return work((n * 3) + 1)
    }
    work(num)
    return count >= 500 ? -1 : count
}

