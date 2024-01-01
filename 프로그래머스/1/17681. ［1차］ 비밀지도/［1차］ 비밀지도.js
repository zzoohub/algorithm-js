function solution(n, arr1, arr2) {
    const newArr1 = arr1.map((x) => {
        let binary = x.toString(2)       
        const diff = n - binary.length
        if(diff) binary = "0".repeat(diff).concat(binary)
        return binary.split("")
    })
    const newArr2 = arr2.map((x) => {
        let binary = x.toString(2)
        const diff = n - binary.length
        if(diff) binary = "0".repeat(diff).concat(binary)        
        return binary.split("")
    })            
    
    const overlaped = newArr1.map((row1, r1) => {        
        return row1.map((x1, i1) => {
            const target = newArr2[r1][i1]
            if(target === "1") return "#"
            return x1 === "1" ? "#" : " "
        }).join("")
    })    
    return overlaped
    
}