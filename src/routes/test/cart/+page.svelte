<script> import { getItems } from '$lib/hooks/counter.svelte';</script>
<div>
    {#each getItems() as item}
        <p>{item.name}</p>
        <p>{item.price}</p>
        <p>{item.quantity}</p>
    {/each}
</div>