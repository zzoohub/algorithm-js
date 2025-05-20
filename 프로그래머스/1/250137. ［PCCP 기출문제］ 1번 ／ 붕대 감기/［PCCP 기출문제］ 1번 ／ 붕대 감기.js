function solution(bandage, health, attacks) {
    const lastAttack = attacks[attacks.length - 1][0]
    let maxHealth = health
        
    const [t, x, y] = bandage;    
    let continueCount = 0;    
    
    for(let i = 0; i < lastAttack; i++) {
        const attack = attacks.find((attack) => attack[0] === i + 1)        
        if(attack) {
            continueCount = 0;
            health -= attack[1]        
            if(health <= 0) return -1
        } else {            
            health = Math.min(health + x, maxHealth)
            continueCount += 1
            if(continueCount === t) {
                continueCount = 0;
                health = Math.min(health + y, maxHealth)
            }
        }
    }
    
    return health
}