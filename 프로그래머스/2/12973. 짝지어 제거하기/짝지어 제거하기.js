function solution(s) {
    const stack = []
    for(let i = 0; i < s.length; i++) {
        if(stack.at(-1) === s[i]) {
            stack.pop()
            continue
        }        
        stack.push(s[i])
    }
    
    return stack.length === 0 ? 1 : 0
}