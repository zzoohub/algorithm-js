function solution(box, n) {
    const boxDemension = box.map((x) => x - (x % n)).reduce((acc, cur) => acc * cur, 1)
    const diceDemension = n ** 3
    
    return Math.floor(boxDemension / diceDemension)
}