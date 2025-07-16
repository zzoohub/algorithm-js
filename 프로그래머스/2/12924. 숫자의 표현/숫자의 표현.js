function solution(n) {
  let count = 0;

  for (let k = 1; (k - 1) * (k / 2) < n; k++) {
    const numerator = n - ((k - 1) * k / 2);
    if (numerator % k === 0) {
      count++;
    }
  }

  return count;
}

