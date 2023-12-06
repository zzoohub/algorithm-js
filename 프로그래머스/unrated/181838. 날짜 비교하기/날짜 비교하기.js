function solution(date1, date2) {
    const dateOne = parseInt(date1.join(""))
    const dateTwo = parseInt(date2.join(""))
    
    return dateOne < dateTwo ? 1 : 0
}