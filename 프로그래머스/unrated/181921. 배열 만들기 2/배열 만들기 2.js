function solution(l, r) {
  const arr = Array.from({ length: r - l + 1}).map((x, i) => String(i + l));
  let result = [];
  for (let x of arr) {
    let bool = true;
    for (let i = 1; i < 10; i++) {
      if (i !== 5 && x.includes(String(i))) bool = false;
    }
    if (bool) result.push(Number(x));
  }
  if (!result[0]) result.push(-1);
  return result;
}