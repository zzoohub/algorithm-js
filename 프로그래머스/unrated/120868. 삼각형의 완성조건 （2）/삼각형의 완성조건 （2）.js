function solution(sides) {
    const [min, max] = sides.sort((x, y) => x - y); // 오름차순 정렬
    let count = 0;    
    for (let i = max - min + 1; i < max + min; i++) {
        count++;
    }
    return count;
}
