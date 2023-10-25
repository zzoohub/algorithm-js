function solution(code) {
    let mode = 0;
    let ret = "";
    [...code].forEach((c, idx) => {
        if(mode === 0) {
            if(c === "1") {
                mode = 1               
            } else {
                if((idx % 2) === 0) {
                    ret += c
                }
            }
        } else {
            if(c === "1") {
                mode = 0
            } else {
                if(idx % 2) {
                    ret += c
                }
            }
        }             
    })
    return ret === "" ? "EMPTY" : ret
}