function solution(chicken) {
    let coopon = 0;
    let serviceChicken = 0;    
    
    while(chicken) {
        chicken = chicken - 1
        coopon = coopon + 1
        if(coopon === 10) {
            chicken = chicken + 1
            serviceChicken = serviceChicken + 1
            coopon = 0
        }
    }
    
    return serviceChicken
}