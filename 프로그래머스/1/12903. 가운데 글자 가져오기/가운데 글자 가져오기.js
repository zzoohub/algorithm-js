function solution(s) {
    const harf = s.length / 2
    if(s.length % 2 === 0) {
        return [...s].filter((x, i) => i === harf || i + 1 === harf).join("")        
    }else {
        return s[Math.floor(harf)]
    }
}