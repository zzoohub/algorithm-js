function solution(quiz) {
    return quiz.map((x) => {
        const [fn, answer] = x.split("=")
        if(eval(fn) === parseInt(answer)) return "O"
        return "X"
    })
}