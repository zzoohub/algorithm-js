function removeNonDuplicateArrays(array) {
    return array.filter((subArray, index, self) => {
        return self.map(arr => JSON.stringify(arr)).indexOf(JSON.stringify(subArray)) !== index 
            || self.map(arr => JSON.stringify(arr)).lastIndexOf(JSON.stringify(subArray)) !== index;
    });
}

function solution(lines) {
    const array = lines.map(([s, e]) => {
        return new Array(Math.abs(e - s + 1)).fill(0).map((x, i) => i + s)
    })
    
    const flated = array.map((arr) => {
        let result = []
        for(let i = 0; i < arr.length; i++) {
            if(arr[i+1] !== undefined) {
             result.push([arr[i], arr[i + 1]])   
            }            
        }
        return result
    }).flat()
    
    const obj = {}
    
    flated.forEach((arr) => {
        obj[arr] = (obj[arr] || 0) + 1
    })
    
    const filterd = Object.entries(obj).filter(([x, y]) => y >= 2).map(([s, i]) => {
        return s.split(",").map((x) => Number(x))
    })
    return filterd.length
    
    
}