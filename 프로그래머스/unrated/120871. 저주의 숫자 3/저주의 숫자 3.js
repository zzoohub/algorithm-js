const make = (n) => {
    if(n % 3 === 0 || String(n).includes("3")) return make(n + 1)
    return n
}

function solution(n) {
    let result = 0
  for(let i = 1; i <= n; i++) {
     let value = result + 1
     result = make(value)
  }
    return result
}