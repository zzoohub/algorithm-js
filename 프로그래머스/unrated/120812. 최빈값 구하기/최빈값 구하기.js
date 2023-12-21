function solution(array) {
    if(array.length === 1) return array[0];
    let frequency = {};
    array.forEach(num => {
        if(frequency[num]) frequency[num]++;
        else frequency[num] = 1;
    });

    let sorted = Object.entries(frequency).sort((a, b) => b[1] - a[1]);
       
    if(sorted.length === 1) return parseInt(sorted[0][0])
    if(sorted[0][1] === sorted[1][1]) return -1;
    
    return parseInt(sorted[0][0]);
}
