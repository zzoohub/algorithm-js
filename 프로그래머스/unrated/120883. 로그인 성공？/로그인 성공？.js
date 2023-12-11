function solution(id_pw, db) {
    const [id, pw] = id_pw
    let result = "fail"
    
    for(let [idx, pwx] of db) {
        if(id === idx && pw === pwx) return "login"
        if(id === idx && pw !== pwx) result = "wrong pw"
    }
    
    return result
}