
function solution(a, b, n) {
    let totalCola = 0;

    while (n >= a) {
        let newCola = Math.floor(n / a) * b; // 새로 받을 콜라의 수
        totalCola += newCola; // 총 콜라 수에 추가
        n = newCola + (n % a); // 새로운 콜라와 남은 빈 병으로 업데이트
    }

    return totalCola;
}
