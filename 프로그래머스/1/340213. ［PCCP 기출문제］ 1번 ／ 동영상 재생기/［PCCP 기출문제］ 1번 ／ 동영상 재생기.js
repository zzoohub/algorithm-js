function solution(video_len, pos, op_start, op_end, commands) {
    const videoLen = parseInt(video_len.replace(":", ""))
    const opStart = parseInt(op_start.replace(":", ""))    
    const opEnd = parseInt(op_end.replace(":", ""))            
    
    let current = parseInt(pos.replace(":", ""))
        
    const calculate = (type, current) => {
        if(type === "next") {
            if(current % 100 >= 50) {                
                current = Math.min(videoLen, current + 50)
            } else {
                current = Math.min(videoLen, current + 10)
            }
        } 
        if(type === "prev") {
            if(current % 100 < 10) {
                current = Math.max(0, current - 50)
            } else {
                current = Math.max(0, current - 10)
            }           
        }
        return current
    }
    
    function formatToTimeFromNumber(num) {
          const str = num.toString().padStart(4, '0');
          return `${str.slice(0, 2)}:${str.slice(2)}`;
    }

    
    for(let command of commands) {
        if((current >= opStart) && (current <= opEnd)) {
            current = opEnd
        }
        let nextValue = calculate(command, current)         
        if((nextValue >= opStart) && (nextValue <= opEnd)) {
            nextValue = opEnd
        }
        current = nextValue
    }
    
    return formatToTimeFromNumber(current)
}