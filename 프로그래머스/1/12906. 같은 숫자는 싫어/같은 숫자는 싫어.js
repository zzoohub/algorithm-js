function solution(arr){
    return arr.reduce((acc, cur, i) => {
        if(i === 0) return [cur]
        if(arr[i - 1] === cur) return acc
        acc.push(cur)
        return acc
    }, [])
}