function solution(wallpaper) {
    
    let top = wallpaper.length;
    let bottom = 0;
    let left = wallpaper[0].length;
    let right = 0;
    
    for(let i = 0; i < wallpaper.length; i++) {
        const row = wallpaper[i]
        if(row.includes("#") && top > i) top = i
        if(row.includes("#") && bottom <= i) bottom = i + 1
        
        for(let j = 0; j < row.length; j++) {
            const cur = row[j];
            if(cur === "#") {
                if(left > j) left = j;
                if(right <= j) right = j + 1;
            }
        }
    }
    
    return [top, left, bottom, right]
}