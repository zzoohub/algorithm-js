function solution(participant, completion) {
    const participantMap = participant.reduce((acc, cur) => {
        if(acc[cur]) {
            acc[cur]++
        } else {
            acc[cur] = 1
        }
        return acc
    }, {})
    
    completion.forEach((user) => {
        if(participantMap[user]) {
            participantMap[user]--
        } 
        if(participantMap[user] === 0) {
            delete participantMap[user]
        }
    })
    
    return Object.keys(participantMap).join("")
}