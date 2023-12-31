function solution(strings, n) {    
    return strings.sort((a, b) => {
        if(a[n].charCodeAt(0) === b[n].charCodeAt(0)) {
            if (a < b) {
                return -1;
            }
            if (a > b) {
                return 1;
            }
            return 0;
        }
        return a[n].charCodeAt(0) - b[n].charCodeAt(0)
    })
}