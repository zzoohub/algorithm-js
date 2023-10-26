function solution(numLog) {
    let result = "";
    numLog.forEach((n, i) => {
        switch(n - numLog[i + 1]) {
            case -1:
                return result += "w"
            case 1:
                return result += "s"
            case -10:
                return result += "d"
            case 10:
                return result += "a"
        }
    })
    return result;
}