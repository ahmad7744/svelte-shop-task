<script lang="ts">
    import ProductCard from "./product-card.svelte";
    let {title, products} = $props();
</script>
<div class="new-arrival py-[70px] max-lg:py-[40px]">
	<div class="container m-auto w-full max-w-[1240px] pr-[15px] pl-[15px]">
		<div class="flex w-full items-center justify-center">
			<h2
				class="font-[League Spartan] mb-[50px] flex items-center justify-center text-center text-[48px] font-bold text-black max-lg:mb-[30px] max-lg:text-[32px]"
			>
				{title}
			</h2>
		</div>
		<div class="grid grid-cols-1 gap-[20px] sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
			{#each products as product}
				<ProductCard {product} />
			{/each}
		</div>
		<div class="flex w-full items-center justify-center pt-[40px]">
			<button
				class="flex w-[220px] items-center justify-center gap-[12px] rounded-[62px] border border-black/10 px-[54px] py-[16px]"
			>
				<span class="font-[Satoshi] text-[16px] leading-[22px] font-medium text-black">
					View All
				</span>
			</button>
		</div>
	</div>
</div>