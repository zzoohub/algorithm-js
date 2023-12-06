function solution(arr) {
    const column = arr.length;
    const row = arr[0].length;

    const diff = column - row;
    if (diff > 0) {        
        return arr.map(x => x.concat(new Array(diff).fill(0)));
    } else if (diff < 0) {        
        const newArr = new Array(row).fill(0)
        return arr.concat(new Array(Math.abs(diff)).fill(newArr))        
    } else {
        return arr
    }
}