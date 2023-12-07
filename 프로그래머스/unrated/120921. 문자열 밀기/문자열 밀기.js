function solution(A, B) {
    let reformed = [...A]
    let count = 0
    if(A === B) return 0
    for(let i = 0; i < reformed.length; i++) {                
        count += 1
        reformed.unshift(reformed.pop())        
        if(reformed.join("") === B) return count
    }
    return -1
}