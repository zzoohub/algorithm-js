function solution(names, yearnings, photo) {
    const yearningMap = {}
    for(let i = 0; i < names.length; i++) {
        const name = names[i]
        const yearning = yearnings[i]
        yearningMap[name] = yearning
    }
    
    
    
    return photo.map((persons) => {        
        return persons.reduce((acc, person) => {
            const friend = yearningMap[person]
            return acc + (friend ? friend : 0 )        
        }, 0)
    })
}