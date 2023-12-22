function solution(s){
    const [a, b] = [...s].map((x) => x.toLowerCase()).reduce((acc, cur) => {
        if(cur === "p") acc[0]++
        if(cur === 'y') acc[1]++
        return acc
    }, [0, 0])
    return a === b
}