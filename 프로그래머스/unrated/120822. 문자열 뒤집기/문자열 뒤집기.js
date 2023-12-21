function solution(my_string) {
    const strings = [...my_string]
    
    for(let i = 0; i < strings.length / 2; i++) {
        [strings[i], strings[strings.length - i - 1]] = [strings[strings.length - i - 1], [strings[i]]]
    }
    return strings.join("")
}