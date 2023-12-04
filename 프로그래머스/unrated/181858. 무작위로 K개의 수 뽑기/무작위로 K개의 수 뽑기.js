function solution(arr, k) {
    const setted = [...new Set(arr)].slice(0, k)
    for(let i = setted.length; i < k; i++) {
        setted.push(-1)
    }
    return setted
}
    
  