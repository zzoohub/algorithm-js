function solution(my_string) {
    const array = my_string.split("")
    
    const num = (n, i) => {
        const next = Number(array[i + 1])
        if(next >= 0) return num(Number(String(n) + String(next)), i + 1)
        return {
            n,
            i
        }
    }
    
    let sum = 0;
    for(let i = 0; i < my_string.length; i++) {
        if(!Number(array[i])) continue;        
        const value = num(Number(array[i]), i)
        sum += value.n
        i = value.i
    }
    return sum
}