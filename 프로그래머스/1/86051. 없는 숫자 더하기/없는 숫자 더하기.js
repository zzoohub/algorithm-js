function solution(numbers) {
    let digit = [0,1,2,3,4,5,6,7,8,9]
    
     numbers.forEach((x) => {
        const index = digit.indexOf(x)
        if(index) {
             digit.splice(index, 1)
        }
    })
    
    console.log(digit)
    
    return digit.filter(x => x).reduce((acc, cur) => acc + cur, 0)
}