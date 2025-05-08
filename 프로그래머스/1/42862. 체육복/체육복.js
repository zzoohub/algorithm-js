function solution(n, lost, reserve) {
    
    const map = new Map()
    for(let i = 1; i <= n; i++) {
        map.set(i, 1)
        if(reserve.includes(i)) map.set(i, map.get(i) + 1)
        if(lost.includes(i)) map.set(i, map.get(i) - 1)
    }
        
    for(let i = 1; i <= n; i++) {
        if(map.get(i) === 0) {
            const prev = map.get(i - 1)
            const next = map.get(i + 1)
            if(prev > 1) {
                map.set(i - 1, prev - 1)   
                map.set(i, 1)   
            } else if(next > 1) {
                map.set(i + 1, next - 1)   
                map.set(i, 1)   
            }
        }
    }
    return Array.from(map).filter(([key, value]) => value > 0).length
}