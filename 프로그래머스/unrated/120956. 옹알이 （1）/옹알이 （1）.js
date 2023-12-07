function solution(babbling) {
    const base = ["aya", "ye", "woo", "ma"];

    const confirm = (word) => {
        let clonedWord = word;
        for (let sound of base) {
            // 단어에서 발음을 찾아 "0"으로 대체
            let regex = new RegExp(sound, "g");
            clonedWord = clonedWord.replace(regex, "0");
        }

        // 만들어진 문자열이 "0"만으로 구성되어 있는지 확인
        return /^0+$/.test(clonedWord);
    };
    
    let result = 0;
    for (let word of babbling) {
        if (confirm(word)) {
            result++;
        }
    }
    return result;
}