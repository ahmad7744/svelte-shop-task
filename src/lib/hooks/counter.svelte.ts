let cart = $state<{id:string, name:string, price:number,quantity:number}[]>([]);

function getItems(){
    return cart;
}

function addItem(item:{id:string, name:string, price:number,quantity:number}){
    cart.push(item);
}
function removeItem(id:string){
    cart = cart.filter(item => item.id !== id);
}
function increaseQuantity(id:string){
    const item = cart.find(item => item.id === id);
    if(item){
        item.quantity++;
    }
}
function decreaseQuantity(id:string){
    const item = cart.find(item => item.id === id);
    if(item){
        item.quantity--;
    }
}


export { getItems, addItem, removeItem, increaseQuantity, decreaseQuantity };
