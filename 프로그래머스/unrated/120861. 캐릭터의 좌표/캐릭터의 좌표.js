function solution(keyinput, board) {
    const xx = Math.floor(board[0] / 2);
    const yy = Math.floor(board[1] / 2);
    let [x, y] = [0, 0];

    keyinput.forEach((key) => {
        switch (key) {
            case "left":
                if (Math.abs(x - 1) > xx) return;
                x -= 1;
                return;
            case "right":
                if (Math.abs(x + 1) > xx) return;
                x += 1;
                return;
            case "up":
                if (Math.abs(y + 1) > yy) return;
                y += 1;
                return;
            case "down":
                if (Math.abs(y - 1) > yy) return;
                y -= 1;
                return;
        }
    });

    return [x, y];
}
