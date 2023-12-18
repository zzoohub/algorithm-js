function solution(s) {
    const origin = s.split(" ")
    console.log(origin)
    return origin.reduce((acc, cur, i) => {
        if(cur === "Z") return acc - origin[i - 1]
        return acc + Number(cur)
    }, 0)
}