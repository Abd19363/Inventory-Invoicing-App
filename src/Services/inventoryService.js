import { fakeApi } from "./fakeApi";

const storage_key= "inventory";

// get all items
export async function getItems(){
    return fakeApi(() =>{
        return JSON.parse(localStorage.getItem(storage_key)) || [];
    })
}

// add a new product to inventory

export async function addItems(item){
    return fakeApi(() =>{

        console.log("Received Items:", item );
        const items= JSON.parse(localStorage.getItem(storage_key)) || [];
        
        const newItem={
            ...item,
            id: Date.now()
        };

        items.push(newItem);
        localStorage.setItem(storage_key, JSON.stringify(items));
        
        return newItem;
    })
}
 // get product by id
export async function getItemById(id){
    return fakeApi(()=>{
        const items= JSON.parse(localStorage.getItem(storage_key)) || [];

        return items.find((item) => item.id === Number(id)
    );
    });
}

// update Inventory
export async function updateItem(updatedItem){

    return fakeApi(()=>{
        const items = JSON.parse(localStorage.getItem(storage_key)) || [];
        const updatedItems = items.map((item)=> item.id === updatedItem.id ? updatedItem: item
    );
       localStorage.setItem(storage_key, JSON.stringify(updatedItems)); 
    return updatedItem;
    });
}

// delete product from inventory

export async function deleteItem(id){


    return fakeApi(() => {
    const items= JSON.parse(localStorage.getItem(storage_key)) ||[];
     const deletedItems= items.filter((item)=> item.id !== Number(id)
    );
    
    localStorage.setItem(storage_key, JSON.stringify(deletedItems));
    
    return true;
  });
}