function solution(arr) {
    function processElement(n) {
        // 50보다 크거나 같은 짝수라면 2로 나누고, 50보다 작은 홀수라면 2를 곱한 후 1을 더합니다.
        if (n >= 50 && n % 2 === 0) {
            return n / 2;
        } else if (n < 50 && n % 2 === 1) {
            return n * 2 + 1;
        }
        return n;
    }

    function processArray(a) {
        // 배열의 각 원소에 대해 처리를 수행합니다.
        return a.map(processElement);
    }

    let x = 0;
    let currentArr = arr;
    let newArr;

    while (true) {
        newArr = processArray(currentArr);

        // 새로운 배열과 현재 배열이 같으면 반복을 중단합니다.
        if (newArr.join(',') === currentArr.join(',')) {
            break;
        }

        currentArr = newArr;
        x++;
    }

    return x;
}