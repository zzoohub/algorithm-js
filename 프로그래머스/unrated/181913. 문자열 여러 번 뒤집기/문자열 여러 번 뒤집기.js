function solution(my_string, queries) {
    const result = [...my_string]
    queries.forEach(([x, y]) => {        
        const reversed = result.slice(x, y + 1).reverse()
        result.splice(x, y - x + 1, ...reversed)
    })
    return result.join("")
}