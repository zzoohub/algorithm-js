function solution(players, callings) {
    const dictionary = {}
    
    players.forEach((x, i) => {
        dictionary[x] = i;
    })
        
    
    callings.forEach(call => {
        const currentRank = dictionary[call];   
        
        if(currentRank > 0) {            
            const frontier = players[currentRank - 1];
            [players[currentRank], players[currentRank - 1]] = [players[currentRank - 1], players[currentRank]]                                 
            dictionary[call] = currentRank - 1
            dictionary[frontier] = currentRank            
        }        
    })
    
    return players
}

