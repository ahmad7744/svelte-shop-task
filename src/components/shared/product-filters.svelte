<script lang="ts">
	let { 
		categories = [],
		filters,
		onFiltersChange,
		loading = false
	} = $props();

	let priceMin = $state(filters.priceRange?.min || 0);
	let priceMax = $state(filters.priceRange?.max || 1000);
	let sortBy = $state(filters.sortBy || 'default');

	// Sync local state with filters prop changes
	$effect(() => {
		priceMin = filters.priceRange?.min || 0;
		priceMax = filters.priceRange?.max || 1000;
		sortBy = filters.sortBy || 'default';
	});

	const handlePriceChange = () => {
		onFiltersChange({
			priceRange: { min: priceMin, max: priceMax }
		});
	};

	const handleSortChange = (newSortBy: string) => {
		sortBy = newSortBy;
		onFiltersChange({
			sortBy: newSortBy
		});
	};

	const handleCategoryChange = (category: string) => {
		onFiltersChange({
			category: category
		});
	};

	const applyFilters = () => {
		onFiltersChange({
			priceRange: { min: priceMin, max: priceMax },
			sortBy
		});
	};

	const resetFilters = () => {
		priceMin = 0;
		priceMax = 1000;
		sortBy = 'default';
		onFiltersChange({
			priceRange: { min: 0, max: 1000 },
			sortBy: 'default',
			category: 'all'
		});
	};
</script>

<div class="box-border w-[100%] rounded-[20px] border border-black/10 p-[20px_24px]">
	<div class="heading mb-[24px] flex items-center justify-between border-b border-black/10 pb-[24px]">
		<h3 class="font-[Satoshi] text-[20px] leading-[27px] font-bold text-black">Filters</h3>
		<i class="fa-regular fa-sliders-up text-[22px]"></i>
	</div>

	<!-- Categories -->
	<div class="categories mb-[25px] flex flex-col gap-[20px] border-b border-black/10 pb-[24px]">
		<h4 class="font-[Satoshi] text-[16px] leading-[22px] font-semibold text-black">Categories</h4>
		{#if loading}
			<div class="animate-pulse">
				{#each Array(5) as _}
					<div class="h-4 bg-gray-300 rounded mb-2"></div>
				{/each}
			</div>
		{:else}
			<button 
				class="flex w-full items-center justify-between text-left hover:bg-gray-50 p-1 rounded"
				onclick={() => handleCategoryChange('all')}
			>
				<p class="font-[Satoshi] text-[16px] leading-[22px] font-[400] {filters.category === 'all' || !filters.category ? 'text-black font-semibold' : 'text-black/60'}">
					All Products
				</p>
				<i class="fa-regular fa-chevron-right"></i>
			</button>
			{#each categories as category}
				<button 
					class="flex w-full items-center justify-between text-left hover:bg-gray-50 p-1 rounded"
					onclick={() => handleCategoryChange(category)}
				>
					<p class="font-[Satoshi] text-[16px] leading-[22px] font-[400] {filters.category === category ? 'text-black font-semibold' : 'text-black/60'} capitalize">
						{category}
					</p>
					<i class="fa-regular fa-chevron-right"></i>
				</button>
			{/each}
		{/if}
	</div>

	<!-- Price Range -->
	<div class="price-range mb-[25px] border-b border-black/10 pb-[24px]">
		<div class="heading mb-[16px] flex items-center justify-between">
			<h3 class="font-[Satoshi] text-[20px] leading-[27px] font-bold text-black">Price</h3>
			<i class="fa-regular fa-dollar-sign text-[22px]"></i>
		</div>
		<div class="flex gap-[10px] mb-[16px]">
			<div class="flex-1">
				<label for="price-min" class="block text-sm font-medium text-gray-700 mb-1">Min</label>
				<input
					id="price-min"
					type="number"
					bind:value={priceMin}
					min="0"
					max="1000"
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
					onchange={handlePriceChange}
				/>
			</div>
			<div class="flex-1">
				<label for="price-max" class="block text-sm font-medium text-gray-700 mb-1">Max</label>
				<input
					id="price-max"
					type="number"
					bind:value={priceMax}
					min="0"
					max="1000"
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
					onchange={handlePriceChange}
				/>
			</div>
		</div>
		<div class="text-sm text-gray-600">
			${priceMin} - ${priceMax}
		</div>
	</div>

	<!-- Sort By -->
	<div class="sort-by mb-[25px] border-b border-black/10 pb-[24px]">
		<div class="heading mb-[16px] flex items-center justify-between">
			<h3 class="font-[Satoshi] text-[20px] leading-[27px] font-bold text-black">Sort By</h3>
			<i class="fa-regular fa-sort text-[22px]"></i>
		</div>
		<div class="flex flex-col gap-[8px]">
			{#each [
				{ value: 'default', label: 'Default' },
				{ value: 'price-low', label: 'Price: Low to High' },
				{ value: 'price-high', label: 'Price: High to Low' },
				{ value: 'name', label: 'Name A-Z' },
				{ value: 'rating', label: 'Highest Rated' }
			] as option}
				<label class="flex items-center gap-[8px] cursor-pointer hover:bg-gray-50 p-2 rounded">
					<input
						type="radio"
						bind:group={sortBy}
						value={option.value}
						onchange={() => handleSortChange(option.value)}
						class="text-black focus:ring-black"
					/>
					<span class="font-[Satoshi] text-[14px] leading-[19px] font-normal text-black">
						{option.label}
					</span>
				</label>
			{/each}
		</div>
	</div>

	<!-- Action Buttons -->
	<div class="flex gap-[10px]">
		<button
			onclick={applyFilters}
			class="flex-1 h-[48px] flex items-center justify-center gap-[12px] rounded-[62px] bg-black px-[24px] py-[16px] font-[Satoshi] text-[14px] leading-[19px] font-medium text-white hover:bg-gray-800 transition-colors"
		>
			Apply Filters
		</button>
		<button
			onclick={resetFilters}
			class="h-[48px] flex items-center justify-center gap-[12px] rounded-[62px] border border-black/10 px-[16px] py-[16px] font-[Satoshi] text-[14px] leading-[19px] font-medium text-black hover:bg-gray-50 transition-colors"
		>
			Reset
		</button>
	</div>
</div> 