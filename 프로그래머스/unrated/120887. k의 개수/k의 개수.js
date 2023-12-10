function solution(i, j, k) {
    let count = 0
    for(let s = i; s <= j; s++) {
        [...String(s)].forEach((z) => {
            if(z === String(k)) count++
        })
    }
    return count
}