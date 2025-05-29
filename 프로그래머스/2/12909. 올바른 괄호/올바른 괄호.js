function solution(s) {
    const stack = [];

    for (const char of s) {
        if (char === '(') {
            stack.push(char);
        } else if (char === ')') {
            if (stack.length === 0) {
                return false; // 닫는 괄호가 먼저 나왔는데 열린 괄호가 없는 경우
            }
            stack.pop(); // 열린 괄호가 있으므로 쌍을 이루어 제거
        }
    }

    return stack.length === 0; // 최종적으로 스택이 비어있어야 모든 괄호가 짝지어진 것임
}