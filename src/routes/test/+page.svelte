<script> import { getItems, addItem, removeItem, increaseQuantity, decreaseQuantity } from '$lib/hooks/counter.svelte';</script>
<div>
    <a href="/test/cart" class="p-2 bg-blue-500 text-white rounded-md">Cart</a>
    {#each getItems() as item}
        <p>{item.name}</p>
        <p>{item.price}</p>
        <p>{item.quantity}</p>
    {/each}
    <button class="p-2 bg-blue-500 text-white rounded-md" on:click={()=>addItem({id:'1',name:'Item 1',price:10,quantity:1})}>Add Item</button>
    <button class="p-2 bg-blue-500 text-white rounded-md" on:click={()=>removeItem('1')}>Remove Item</button>
    <button class="p-2 bg-blue-500 text-white rounded-md" on:click={()=>increaseQuantity('1')}>Increase Quantity</button>
    <button class="p-2 bg-blue-500 text-white rounded-md" on:click={()=>decreaseQuantity('1')}>Decrease Quantity</button>
</div>