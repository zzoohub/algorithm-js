function solution(nums) {
    const setSize = (new Set(nums)).size
    return Math.min(nums.length / 2, setSize)
}