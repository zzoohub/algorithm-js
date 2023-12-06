function solution(arr, delete_list) {
    return arr.reduce((acc, cur, i) => {
        if(delete_list.includes(cur)) return [...acc]
        return [...acc, cur]
    }, [])
}