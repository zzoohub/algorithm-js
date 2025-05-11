function solution(ingredient) {
    const stack = []
    let count = 0;
    
    for(const item of ingredient) {
        stack.push(item)
        if(stack.length >= 4) {
            if(stack.slice(-4).join("") === "1231") {
                stack.pop()
                stack.pop()
                stack.pop()
                stack.pop()
                count++
            }
        }
    }
    
    return count
}