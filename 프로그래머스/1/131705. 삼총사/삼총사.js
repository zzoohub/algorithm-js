function solution(number) {
    const combi = combinations(number, 3)
    console.log(`combination: [${combi}]`)
    return combi.filter((arr) => arr.reduce((acc, cur) => acc + cur, 0) === 0).length
}

// function permutations(arr) {
//     if (arr.length <= 1) return [arr];
//     return arr.flatMap((item, i) => 
//         permutations(arr.slice(0, i).concat(arr.slice(i + 1))).map(p => [item, ...p])
//     );
// }

function combinations(arr, n) {
    if (n === 0) return [[]];
    if (n > arr.length) return [];
    console.log(`arr: [${arr}], n: ${n}`)
    return arr.flatMap((item, i) => 
        combinations(arr.slice(i + 1), n - 1).map(c => [item, ...c])
    );
}