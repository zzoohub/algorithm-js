function solution(s) {
   const nums = s.split(" ").map(Number)
   const min = Math.min(...nums)
   const max = Math.max(...nums)
   
   return `${min} ${max}` 
}