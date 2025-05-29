function solution(friends, gifts) {
    
    const n = friends.length;
    const giftRecordsMap = new Map();
    const giveCountsMap = new Map();
    const receiveCountsMap = new Map();
    const giftIndicesMap = new Map();
    const nextMonthGiftsMap = new Map();

    friends.forEach(friend => {
        giftRecordsMap.set(friend, new Map());
        giveCountsMap.set(friend, 0);
        receiveCountsMap.set(friend, 0);
        nextMonthGiftsMap.set(friend, 0);
    });

    for (const gift of gifts) {
        const [giver, receiver] = gift.split(" ");
        giveCountsMap.set(giver, giveCountsMap.get(giver) + 1);
        receiveCountsMap.set(receiver, receiveCountsMap.get(receiver) + 1);
        giftRecordsMap.get(giver).set(receiver, (giftRecordsMap.get(giver).get(receiver) || 0) + 1);
    }

    friends.forEach(friend => {
        giftIndicesMap.set(friend, (giveCountsMap.get(friend) || 0) - (receiveCountsMap.get(friend) || 0));
    });

    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            const friendA = friends[i];
            const friendB = friends[j];
            const giveAtoB = giftRecordsMap.get(friendA)?.get(friendB) || 0;
            const giveBtoA = giftRecordsMap.get(friendB)?.get(friendA) || 0;
            const indexA = giftIndicesMap.get(friendA) || 0;
            const indexB = giftIndicesMap.get(friendB) || 0;

            if (giveAtoB > giveBtoA) {
                nextMonthGiftsMap.set(friendA, nextMonthGiftsMap.get(friendA) + 1);
            } else if (giveBtoA > giveAtoB) {
                nextMonthGiftsMap.set(friendB, nextMonthGiftsMap.get(friendB) + 1);
            } else {
                if (indexA > indexB) {
                    nextMonthGiftsMap.set(friendA, nextMonthGiftsMap.get(friendA) + 1);
                } else if (indexB > indexA) {
                    nextMonthGiftsMap.set(friendB, nextMonthGiftsMap.get(friendB) + 1);
                }
            }
        }
    }

    return Math.max(...Array.from(nextMonthGiftsMap.values()));
}