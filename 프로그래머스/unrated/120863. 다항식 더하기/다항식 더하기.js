function solution(polynomial) {
    const obj = {
        x: 0,
        n: 0
    }
    
    polynomial.split("+").map(x => x.trim()).forEach((x) => {
        if(x.includes("x")) {
            const splited = x.split("")
            if(splited.length > 1) {                
                const xValue = [...x].filter((x) => x !== "x").join("")    
                obj.x += Number(xValue)
            } else {
                obj.x++
            }
        } else {
            obj.n += Number(x)
        }        
    }) 
    if(obj.x && obj.x === 1 && obj.n) return `x + ${obj.n}`
    if(obj.x && obj.n) return `${obj.x}x + ${obj.n}`
    if(obj.x === 1) return `x`
    if(obj.x) return `${obj.x}x`
    if(obj.n) return `${obj.n}`
}