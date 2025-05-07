function solution(keymap, targets) {
    const maxKeyLength = Math.max(...keymap.map(key => key.length))
    
    const results = targets.map((target) => {
        const alphabets = [...target]
        let result = 0;        
        
        for(let i = 0; i < alphabets.length; i++) {
            const alphabet = alphabets[i]
            const indexes = keymap.map((key) => key.indexOf(alphabet)).filter(x => x !== -1)     
            if(indexes.length === 0) {                
                return -1;
            } else {
                const index = Math.min(...indexes)    
                result += index + 1;
            }                                    
        }
        return result
    })
    
    return results
}