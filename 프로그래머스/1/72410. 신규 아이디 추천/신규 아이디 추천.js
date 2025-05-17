function solution(new_id) {    
    const one = (id) => id.toLowerCase()
    const two = (id) => id.replaceAll(/[^a-z0-9._-]/g, '');
     const three = (id) => {
        while (id.includes("..")) {
          id = id.replace("..", ".");
        }
        return id;
      };
    const four = (id) => {
        if(id.startsWith(".")) {
            id = id.slice(1)
        }
        if(id.endsWith(".")) {
            id = id.slice(0, -1)
        }
        return id
    }
    const five = (id) => {
        if(id === "") return "a"
        return id
    }
    const six = (id) => {
        if(id.length > 15) {
            id = id.slice(0, 15)
            id = (four(id))
        }
        return id
    }
    const seven = (id) => {
        if(id.length <= 2) {
            const last = id[id.length - 1]
            while(id.length < 3) {
                id += last
            }
        }
        return id
    }
    
    return [one, two, three, four, five, six, seven].reduce((acc, fn) => {
        return fn(acc)
    }, new_id)
}