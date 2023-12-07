function solution(common) {
    const diff1 = common[1] - common[0]
    const diff2 = common[2] - common[1]
    
    if(diff1 === diff2) return common.at(-1) + diff1
    return (diff2 / diff1) * common.at(-1)
}