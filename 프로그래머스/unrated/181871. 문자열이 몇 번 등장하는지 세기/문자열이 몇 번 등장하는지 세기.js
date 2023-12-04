function solution(myString, pat) {
    let count = 0;
    let pos = 0;

    while (pos < myString.length) {
        // 'pat'이 'myString'에서 다음으로 나타나는 위치 찾기
        pos = myString.indexOf(pat, pos);

        // 더 이상 'pat'이 없으면 반복 종료
        if (pos === -1) break;

        // 'pat'이 나타나면 카운트 증가
        count++;

        // 'indexOf' 검색 시작 위치를 1 증가
        pos++;
    }

    return count;
}
