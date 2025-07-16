function solution(n) {
    const oneCount = n.toString(2).replaceAll("0", "").length
    
    let current = n
    while(true) {        
        current += 1
        const binary = current.toString(2)                
        const nextOneCount = binary.replaceAll("0", "").length
        if(oneCount === nextOneCount) {
            return current
        }
    }    
}