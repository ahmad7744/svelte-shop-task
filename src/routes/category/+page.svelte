<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Header from "../../components/global/header.svelte";
	import Discount from "../../components/shared/discount.svelte";
	import Footer from "../../components/global/footer.svelte";
	import NewsLetter from "../../components/shared/news-letter.svelte";
	import ProductCard from "../../components/shared/product-card.svelte";
	import LoadingSkeleton from "../../components/shared/loading-skeleton.svelte";
	import ProductFilters from "../../components/shared/product-filters.svelte";
	import Pagination from "../../components/shared/pagination.svelte";
	import { useCategoryProducts } from '$lib/hooks/useProducts';

	// Get the hook for category products
	const { 
		categoryProductsStore, 
		categoriesStore, 
		loadCategoryProducts, 
		updateFilters, 
		setCurrentPage, 
		loadCategories 
	} = useCategoryProducts();

	// Track previous URL to detect changes
	let previousUrl = '';

	// Get current page from URL params
	const getCurrentPage = () => {
		const pageParam = $page.url.searchParams.get('page');
		return pageParam ? parseInt(pageParam, 10) : 1;
	};

	// Get category from URL params
	const getCurrentCategory = () => {
		return $page.url.searchParams.get('category') || 'all';
	};

	// Get search query from URL params
	const getCurrentSearch = () => {
		return $page.url.searchParams.get('search') || '';
	};

	// Get paginated products
	const getPaginatedProducts = (categoryData: any) => {
		const startIndex = (categoryData.currentPage - 1) * categoryData.itemsPerPage;
		const endIndex = startIndex + categoryData.itemsPerPage;
		return categoryData.filteredProducts.slice(startIndex, endIndex);
	};

	// Handle page changes
	const handlePageChange = (newPage: number) => {
		// Don't update the store here, let the URL change handler do it
		// This prevents double updates
	};

	// Handle filter changes
	const handleFiltersChange = (newFilters: any) => {
		updateFilters(newFilters);
		
		// Update URL if category changed
		if (newFilters.category && newFilters.category !== getCurrentCategory()) {
			const url = new URL($page.url);
			url.searchParams.set('category', newFilters.category);
			url.searchParams.delete('page'); // Reset page when category changes
			goto(url.toString(), { replaceState: false });
		}
	};

	// Handle sort change
	const handleSortChange = (sortBy: string) => {
		updateFilters({ sortBy });
	};

	// Get category display name
	const getCategoryDisplayName = (category: string) => {
		if (!category || category === 'all') return 'All Products';
		return category.charAt(0).toUpperCase() + category.slice(1);
	};

	// Filter products by search query
	const filterProductsBySearch = (products: any[], searchQuery: string) => {
		if (!searchQuery.trim()) return products;
		
		const lowercaseQuery = searchQuery.toLowerCase();
		return products.filter(product => 
			product.name.toLowerCase().includes(lowercaseQuery) ||
			product.category.toLowerCase().includes(lowercaseQuery) ||
			product.description.toLowerCase().includes(lowercaseQuery)
		);
	};

	// Initialize data on mount
	onMount(async () => {
		const currentCategory = getCurrentCategory();
		const currentPage = getCurrentPage();
		const currentSearch = getCurrentSearch();
		
		// Load categories and products
		await Promise.all([
			loadCategories(),
			loadCategoryProducts(currentCategory === 'all' ? undefined : currentCategory)
		]);
		
		// Apply search filter if there's a search query
		if (currentSearch) {
			const allProducts = $categoryProductsStore.filteredProducts;
			const searchFiltered = filterProductsBySearch(allProducts, currentSearch);
			// Update the store with search results
			updateFilters({ searchQuery: currentSearch });
		}
		
		// Set current page from URL
		setCurrentPage(currentPage);
		
		// Set initial URL
		previousUrl = $page.url.toString();
	});

	// Watch for URL changes and update store accordingly
	$: if ($page.url.toString() !== previousUrl && previousUrl !== '') {
		const currentPage = getCurrentPage();
		const currentCategory = getCurrentCategory();
		const currentSearch = getCurrentSearch();
		const storeCategory = $categoryProductsStore.filters.category;
		const storePage = $categoryProductsStore.currentPage;
		
		// Handle category changes
		if (currentCategory !== storeCategory) {
			loadCategoryProducts(currentCategory === 'all' ? undefined : currentCategory);
		}
		
		// Handle search changes
		if (currentSearch) {
			updateFilters({ searchQuery: currentSearch });
		}
		
		// Handle page changes
		if (currentPage !== storePage) {
			setCurrentPage(currentPage);
		}
		
		previousUrl = $page.url.toString();
	}
</script>

<Discount />
<Header />

<div class="container m-auto w-full max-w-[1240px] pr-[15px] pl-[15px]">
	<div class="categories-body mb-[80px] w-full border-t border-gray-300 pt-[25px]">
		<div class="breadcrumb mb-[25px] flex items-center gap-[8px]">
			<a href="/" class="font-[Satoshi] text-[16px] leading-[22px] font-normal text-black/60 hover:text-black">Home</a>
			<span><i class="fa-regular fa-angle-right"></i></span>
			{#if getCurrentSearch()}
				<p class="font-[Satoshi] text-[16px] leading-[22px] font-normal text-black">
					Search Results for "{getCurrentSearch()}"
				</p>
			{:else}
				<p class="font-[Satoshi] text-[16px] leading-[22px] font-normal text-black">
					{getCategoryDisplayName($categoryProductsStore.filters.category)}
				</p>
			{/if}
		</div>
		
		<div class="grid grid-cols-12 gap-6">
			<!-- Filters Sidebar -->
			<div class="col-span-12 md:col-span-3">
				<ProductFilters 
					categories={$categoriesStore.categories}
					filters={$categoryProductsStore.filters}
					loading={$categoriesStore.loading}
					onFiltersChange={handleFiltersChange}
				/>
			</div>
			
			<!-- Products Section -->
			<div class="col-span-12 md:col-span-9">
				<div class="section-heading mb-[20px] flex w-full items-center justify-between max-md:flex-col">
					<div class="max-md:mb-[20px]">
						<h2 class="flex items-center font-[Satoshi] text-[32px] leading-[43px] font-bold text-black">
							{#if getCurrentSearch()}
								Search Results for "{getCurrentSearch()}"
							{:else}
								{getCategoryDisplayName($categoryProductsStore.filters.category)}
							{/if}
						</h2>
					</div>
					<div class="flex items-center justify-center gap-[20px] max-md:flex-col">
						<p class="font-[Satoshi] text-[16px] leading-[22px] font-normal text-black/60">
							Showing {Math.min(($categoryProductsStore.currentPage - 1) * $categoryProductsStore.itemsPerPage + 1, $categoryProductsStore.totalProducts)}–{Math.min($categoryProductsStore.currentPage * $categoryProductsStore.itemsPerPage, $categoryProductsStore.totalProducts)} of {$categoryProductsStore.totalProducts} Products
						</p>
						<label class="font-[Satoshi] text-[16px] leading-[22px] font-normal text-black/60">
							Sort by:
							<select
								class="border-none bg-transparent p-0 pr-[30px] font-[Satoshi] text-[16px] leading-[22px] font-bold text-black/60 focus:ring-0 focus:outline-none"
								value={$categoryProductsStore.filters.sortBy}
								onchange={(e) => handleSortChange((e.target as HTMLSelectElement)?.value||"")}
							>
								<option value="default">Default</option>
								<option value="price-low">Price: Low to High</option>
								<option value="price-high">Price: High to Low</option>
								<option value="name">Name A-Z</option>
								<option value="rating">Highest Rated</option>
							</select>
						</label>
					</div>
				</div>

				<!-- Products Grid -->
				{#if $categoryProductsStore.loading}
					<div class="mb-[30px] grid grid-cols-1 gap-[20px] sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
						{#each Array(9) as _}
							<div class="animate-pulse">
								<div class="mb-[15px] h-[298px] w-[100%] bg-gray-300 rounded-[20px]"></div>
								<div class="h-4 bg-gray-300 rounded mb-2"></div>
								<div class="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
								<div class="h-6 bg-gray-300 rounded w-1/3"></div>
							</div>
						{/each}
					</div>
				{:else if $categoryProductsStore.error}
					<div class="text-center py-8">
						<p class="text-red-500 mb-4">Error loading products: {$categoryProductsStore.error}</p>
						<button 
							class="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
							onclick={() => loadCategoryProducts($categoryProductsStore.filters.category === 'all' ? undefined : $categoryProductsStore.filters.category)}
						>
							Retry
						</button>
					</div>
				{:else if getPaginatedProducts($categoryProductsStore).length === 0}
					<div class="text-center py-8">
						<p class="text-gray-500 mb-4">No products found matching your criteria.</p>
						<button 
							class="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
							onclick={() => handleFiltersChange({ category: 'all', priceRange: { min: 0, max: 1000 }, sortBy: 'default' })}
						>
							Reset Filters
						</button>
					</div>
				{:else}
					<div class="mb-[30px] grid grid-cols-1 gap-[20px] sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
						{#each getPaginatedProducts($categoryProductsStore) as product}
							<ProductCard {product} />
						{/each}
					</div>
				{/if}

				<!-- Pagination -->
				{#if !$categoryProductsStore.loading && $categoryProductsStore.totalProducts > 0}
					<Pagination 
						currentPage={$categoryProductsStore.currentPage}
						totalItems={$categoryProductsStore.totalProducts}
						itemsPerPage={$categoryProductsStore.itemsPerPage}
						onPageChange={handlePageChange}
					/>
				{/if}
			</div>
		</div>
	</div>
</div>

<NewsLetter />
<Footer />
