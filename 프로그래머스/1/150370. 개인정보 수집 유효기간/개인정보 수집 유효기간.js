function solution(today, terms, privacies) {
    
    terms = Object.fromEntries(terms.map((x) => {
        const map = x.split(" ")
        map[1] = Number(map[1])
        return map
    }))                    
    
    const addMonth = (year, month, day, plus) => {
      // 1) 수집일 + plus 개월
      let newMonth = month + plus;
      let newYear = year + Math.floor((newMonth - 1) / 12);
      newMonth = ((newMonth - 1) % 12) + 1;

      // 2) 만료일 = (수집일+개월)에서 하루 전
      if (day > 1) {
        return [newYear, newMonth, day - 1];
      } else {
        // day === 1 → 이전 달의 28일
        newMonth -= 1;
        if (newMonth === 0) {
          newMonth = 12;
          newYear -= 1;
        }
        return [newYear, newMonth, 28];
      }
    }; 
    
    const isOver = (date, type) => {        
        const term = terms[type]            
        const [todayYear, todayMonth, todayDay] = today.split(".").map(Number);
        const [collectionYear, collectionMonth, collectionDay] = date.split(".").map(Number);
        const [expiryYear, expiryMonth, expiryDay] = addMonth(collectionYear, collectionMonth, collectionDay, term);                     
        
        if (todayYear > expiryYear) return true;
        if (todayYear < expiryYear) return false;
        if (todayMonth > expiryMonth) return true;
        if (todayMonth < expiryMonth) return false;
        if (todayDay > expiryDay) return true;
        return false
    }
    
    return privacies.map((privacy) => privacy.split(" "))
        .map(([date, type], i) => {
            if(isOver(date, type)) return i + 1
            return 0
        }).filter(x => x !== 0)
}