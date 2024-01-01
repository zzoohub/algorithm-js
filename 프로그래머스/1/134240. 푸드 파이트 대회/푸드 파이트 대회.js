function solution(food) {
    let result = ""
    const maped = food.map((x) => {
        return Math.floor(x / 2)
    })
    maped.forEach((x, i) => {
        result += String(i).repeat(x)
    })
    
    return result + "0" + [...result].reverse().join("")
}