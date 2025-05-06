function solution(s, skip, index) {
   function getNextCharCode(cur, jump) {
  // 'a' 코드(97)를 기준으로 26글자 안에서만 순회하도록
  return ( (cur - 97 + jump) % 26 ) + 97;
} 
    function getValue(char) {
        const curCharCode = char.charCodeAt()
        let skipCount = 0;
        let count = 1;    
        let value = "";        
        while(count <= index) {            
            const nextCharCode = getNextCharCode(curCharCode, count + skipCount)                      
            const nextValue = String.fromCharCode(nextCharCode)                 
            if(skip.includes(nextValue)) {
                skipCount++
                continue
            }            
            if(count === index) {
                return nextValue;
            }
            count++
        }        
    }
    
    let result = ""
    for(let i = 0; i < s.length; i++) {                  
       result += getValue(s[i])               
    }    
    
    return result
}