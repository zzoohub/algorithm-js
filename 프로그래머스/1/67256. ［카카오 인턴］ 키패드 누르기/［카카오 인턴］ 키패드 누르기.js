function solution(numbers, hand) {
    const keyboard = {
      1: [0, 0], 2: [0, 1], 3: [0, 2],
      4: [1, 0], 5: [1, 1], 6: [1, 2],
      7: [2, 0], 8: [2, 1], 9: [2, 2],
      '*': [3, 0], 0: [3, 1], '#': [3, 2],
    };
    
    let curLeft = "*";
    let curRight = "#";
    
    let result = ""        
    
    for(let num of numbers) {
        if([1,4,7].includes(num)) {
            result += "L";
            curLeft = num
        } else if([3,6,9].includes(num)) {
            result += "R";
            curRight = num
        } else {
            const [lx, ly] = keyboard[curLeft]
            const [rx, ry] = keyboard[curRight]
            const [tx, ty] = keyboard[num]
            
            const leftDiff = Math.abs(lx - tx) + Math.abs(ly - ty)
            const rightDiff = Math.abs(rx - tx) + Math.abs(ry - ty)
            
            if(leftDiff === rightDiff) {
                if(hand === "left") {
                    curLeft = num
                    result += "L"
                } else {
                    curRight = num
                    result += "R"
                }
            } else if(leftDiff < rightDiff) {
                curLeft = num
                result += "L"               
            } else if(leftDiff > rightDiff) {
                curRight = num
                result += "R"
            }
        }
    }
    
    return result
}