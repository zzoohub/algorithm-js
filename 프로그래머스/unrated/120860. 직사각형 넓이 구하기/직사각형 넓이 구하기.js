function solution(dots) {
    const transformed = dots.reduce((acc, cur) => {
        acc.x.push(cur[0]);
        acc.y.push(cur[1]);
        return acc;
    }, {x: [], y: []} );   
    
    const xMin = Math.min(...transformed.x)
    const xMax = Math.max(...transformed.x)
    const yMin = Math.min(...transformed.y)
    const yMax = Math.max(...transformed.y)
    
    return (xMax - xMin) * (yMax - yMin)
}
