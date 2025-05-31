function solution(s) {
  let count = 0;
  let deletedZeroCount = 0;

  function calculate(str) {
    if (str === "1") return;

    const originalLen = str.length;
    const filtered = str.replaceAll("0", ""); // "0" 제거한 문자열
    const filteredLen = filtered.length;

    deletedZeroCount += originalLen - filteredLen;
    count += 1;

    const nextStr = filteredLen.toString(2); // 이진수 변환
    calculate(nextStr);
  }

  calculate(s);

  return [count, deletedZeroCount];
}