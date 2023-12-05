function solution(n_str) {
    while(n_str.startsWith("0")) {
        n_str = [...n_str].splice(1).join("")
    }
    return n_str
}