function solution(n, m, section) {
    
    const map = section.reduce((acc, cur) => {
        acc[cur] = true;
        return acc
    }, {})
    
    let count = 0;
    for(let i = section[0]; i <= section[section.length - 1]; i++) {
        const current = map[i]
        if(current) {
            count += 1
            i += m - 1
        }
    }
    
    return count
}