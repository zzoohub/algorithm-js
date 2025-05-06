function solution(s, skip, index) {
  const skipSet = new Set(skip);  
  return [...s].map(char => {
    let code = char.charCodeAt(0);
    let moved = 0;

    while (moved < index) {
      // 다음 문자로 이동 (z → a)
      code = code === 122 ? 97 : code + 1;
      // skip 에 없으면 이동 카운트
      if (!skipSet.has(String.fromCharCode(code))) moved++;
    }

    return String.fromCharCode(code);
  }).join('');
}