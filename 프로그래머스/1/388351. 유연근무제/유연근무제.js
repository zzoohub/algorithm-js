function solution(schedules, timelogs, startday) {
    const nextDay = (n) => n % 7 === 0 ? 7 : n % 7
    
    const addTenMinute = (time) => {        
        const minute = time % 100
        if(minute < 50) {
            time += 10   
        } else {
            time += 50
        }             
        return time
    }
    
    const isOk = (schedule, timelog) => {
        let day = startday
        for(let i = 0; i < timelog.length; i++) {            
            const time = timelog[i]
            if(addTenMinute(schedule) < time && day <= 5) return false
            day = nextDay(day + 1)
        }
        return true
    }
    
    let result = 0;
    
    for(let i = 0; i < schedules.length; i++) {
        const schedule = schedules[i]
        const timelog = timelogs[i]
                
        if(isOk(schedule, timelog)) {            
            result += 1
        }
    }
    
    return result
}