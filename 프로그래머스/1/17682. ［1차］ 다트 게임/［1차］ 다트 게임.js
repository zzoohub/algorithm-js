function solution(dartResult) {
    const matches = dartResult.match(/\d+[SDT][*#]?/g);
    
    let scores = []
    matches.map((match, i) => {
        let [score, bonus, random] =  match.match(/\d+|[SDT]|[*#]/g)
        score = calculateScore(Number(score), bonus)
        switch(random) {
            case "*":
                scores[i - 1] *= 2
                scores[i] = score * 2
                break
            case "#":
                scores[i] = score * -1
                break
            default:
                scores[i] = score
                break
        }
    })        
    
    
    function calculateScore(score, bonus) {        
        let n = score
        switch(bonus) {
            case "D":
                n = Math.pow(n, 2)
                break
            case "T":
                n = Math.pow(n, 3)
                break;
        }
        return n;
    }
    
    return scores.reduce((acc, cur) => acc + cur)
}