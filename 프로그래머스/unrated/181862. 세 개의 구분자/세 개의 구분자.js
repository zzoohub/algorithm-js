function solution(myStr) {
    const splited = myStr.split(/[abc]/).filter((x) => x)
    if(splited.length === 0) return ["EMPTY"]
    return splited
}