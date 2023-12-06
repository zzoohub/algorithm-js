function solution(n) {
    const init = new Array(n * n).fill(0)
    
    let current = 0;
    
    const chunkArray = (arr, offset) => {
        let result = []
        for(let i = 0; i < arr.length; i += offset) {
            result.push(arr.slice(i, i + offset)) 
        }
        return result
    }

    const right = (i) => {
        init[i - 1] = ++current
        if(current === n**2) return init
        if(i % n === 0 || init[i] !== 0) return bottom(i + n)        
        right(i + 1)
    }
    
    const bottom = (i) => {
        init[i - 1] = ++current
        if(current === n**2) return init
        if(init[i - 1 + n] === undefined || init[i - 1 + n] !== 0) return left(i - 1)
        bottom(i + n)
    }
    
    const left = (i) => {
        init[i - 1] = ++current
        if(current === n**2) return init
        if((i - 1) % n === 0 || init[i - 2] !== 0) return top(i - n)
        left(i - 1)
    }
    
    const top = (i) => {
        init[i - 1] = ++current
        if(current === n**2) return init
        if(init[i - 1 - n] === undefined || init[i - 1 - n] !== 0) return right(i + 1)
        top(i - n)
    }
    right(1)
    return chunkArray(init, n)
}