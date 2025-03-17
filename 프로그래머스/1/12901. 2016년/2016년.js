function solution(a, b) {
    const date = new Date(`2016-${String(a).padStart("0", 2)}-${String(b).padStart("0", 2)}`)
    const day = date.getDay()

    
    const dayMap = {
       0:  "SUN", 1: "MON", 2: "TUE", 3: "WED", 4: "THU", 5: "FRI", 6: "SAT"
    }
    
    return dayMap[day]
}