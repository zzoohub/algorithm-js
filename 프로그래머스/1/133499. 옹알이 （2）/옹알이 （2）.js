function solution(babbling) {
  let count = 0;
  const sounds = ["aya", "ye", "woo", "ma"];

  for (let word of babbling) {
    let i = 0;
    let last = "";
    let valid = true;
    while (i < word.length) {
      let found = false;
      for (let sound of sounds) {
        // Check if the substring starting at i matches the sound and is not the same as the previous one
        if (word.startsWith(sound, i) && sound !== last) {
          i += sound.length;
          last = sound;
          found = true;
          break;
        }
      }
      if (!found) {
        valid = false;
        break;
      }
    }
    if (valid && i === word.length) count++;
  }
  
  return count;
}