<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { useProducts } from '$lib/hooks/useProducts';
	import { getCartState } from '$lib/hooks/cart.svelte'
	import CartDropdown from '../shared/cart-dropdown.svelte';
	import type { ProductForUI } from '$lib/api/products';

	// Get products hook
	const { uiProductsStore, loadProducts } = useProducts();

	// Get cart hook
	console.log('cartState', getCartState());
	// Search state
	let searchQuery = $state('');
	let searchResults: ProductForUI[] = $state([]);
	let showDropdown = $state(false);
	let searchInputRef: HTMLInputElement;
	let searchTimeout: number;

	// Cart dropdown state
	let showCartDropdown = $state(false);

	// Filter products based on search query
	const filterProducts = (query: string, products: ProductForUI[]) => {
		if (!query.trim()) return [];
		
		const lowercaseQuery = query.toLowerCase();
		return products.filter(product => 
			product.name.toLowerCase().includes(lowercaseQuery) ||
			product.category.toLowerCase().includes(lowercaseQuery) ||
			product.description.toLowerCase().includes(lowercaseQuery)
		).slice(0, 8); // Limit to 8 results
	};

	// Debounced search function
	const debouncedSearch = (query: string) => {
		// Clear existing timeout
		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}

		// Set new timeout for 300ms debouncing
		searchTimeout = setTimeout(() => {
			if (query.trim()) {
				searchResults = filterProducts(query, $uiProductsStore.allProducts);
				showDropdown = searchResults.length > 0;
			} else {
				searchResults = [];
				showDropdown = false;
			}
		}, 300);
	};

	// Handle search input with debouncing
	const handleSearchInput = (event: Event) => {
		const target = event.target as HTMLInputElement;
		searchQuery = target.value;
		
		// Use debounced search
		debouncedSearch(searchQuery);
	};

	// Handle product selection
	const handleProductSelect = (productId: string) => {
		// Clear timeout when user selects a product
		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}
		searchQuery = '';
		searchResults = [];
		showDropdown = false;
		goto(`/product-detail/${productId}`);
	};

	// Handle search form submission
	const handleSearchSubmit = (event: Event) => {
		event.preventDefault();
		// Clear timeout on form submission
		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}
		if (searchQuery.trim()) {
			goto(`/category?search=${encodeURIComponent(searchQuery.trim())}`);
			searchQuery = '';
			searchResults = [];
			showDropdown = false;
		}
	};

	// Handle click outside to close dropdown
	const handleClickOutside = (event: Event) => {
		const target = event.target as HTMLElement;
		const searchContainer = target.closest('.search-container');
		if (!searchContainer) {
			showDropdown = false;
		}
	};

	// Handle keyboard navigation
	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			showDropdown = false;
			searchInputRef?.blur();
			// Clear timeout on escape
			if (searchTimeout) {
				clearTimeout(searchTimeout);
			}
		}
	};

	// Handle cart icon click
	const handleCartClick = () => {
		console.log('Cart icon clicked');
		showCartDropdown = !showCartDropdown;
	};

	// Handle cart dropdown close
	const handleCartDropdownClose = () => {
		showCartDropdown = false;
	};

	// Load products on mount
	onMount(() => {
		loadProducts();
		document.addEventListener('click', handleClickOutside);
		document.addEventListener('keydown', handleKeyDown);
		
		return () => {
			document.removeEventListener('click', handleClickOutside);
			document.removeEventListener('keydown', handleKeyDown);
			// Clear timeout on component unmount
			if (searchTimeout) {
				clearTimeout(searchTimeout);
			}
		};
	});
	// Live users counter
	let liveUsers = $state(Math.floor(Math.random() * 50) + 20); // Start with 20-70 users

	// Update live users every 2 seconds
	let liveUsersInterval: number;

	const updateLiveUsers = () => {
		// Generate a realistic fluctuation (±5 users)
		const change = Math.floor(Math.random() * 11) - 5; // -5 to +5
		const newCount = Math.max(15, Math.min(100, liveUsers + change)); // Keep between 15-100
		liveUsers = newCount;
	};

	// Start live users counter on mount
	onMount(() => {
		liveUsersInterval = setInterval(updateLiveUsers, 2000);
		
		return () => {
			if (liveUsersInterval) {
				clearInterval(liveUsersInterval);
			}
		};
	});
</script>

<div class="header min-h-[95px] w-[100%] max-lg:min-h-auto">
	<div class="container m-auto w-full max-w-[1240px] pr-[15px] pl-[15px]">
		<div class="flex items-center justify-between py-[20px] text-gray-900">
			<a href="/">
				<img src="/images/logo.png" class="h-[22px]" alt="Logo" />
			</a>
			<div class="flex gap-[24px] max-md:hidden">
				<a href="/" class="font-[Satoshi] text-[16px] font-normal text-black hover:text-gray-600 transition-colors">Shop</a>
				<a href="/category?page=1" class="font-[Satoshi] text-[16px] font-normal text-black hover:text-gray-600 transition-colors">On Sale</a>
				<a href="/" class="font-[Satoshi] text-[16px] font-normal text-black hover:text-gray-600 transition-colors">New Arrivals</a>
				<a href="/" class="font-[Satoshi] text-[16px] font-normal text-black hover:text-gray-600 transition-colors">Brands</a>
			</div>
			
			<!-- Search Bar with Dropdown -->
			<div class="search-container relative max-lg:hidden">
				<form onsubmit={handleSearchSubmit}>
					<input
						bind:this={searchInputRef}
						type="text"
						bind:value={searchQuery}
						oninput={handleSearchInput}
						onfocus={() => searchResults.length > 0 && (showDropdown = true)}
						class="order-2 h-[48px] w-[550px] flex-none grow gap-[12px] rounded-[62px] border-0 bg-[#F0F0F0] p-[12px_16px] pl-[50px] max-xl:w-[360px] focus:outline-none focus:ring-2 focus:ring-black/10"
						placeholder="Search for products..."
					/>
					<i class="fa-regular fa-magnifying-glass absolute top-[15px] left-[20px] z-10 text-[18px] text-[#00000071]"></i>
				</form>
				
				<!-- Search Results Dropdown -->
				{#if showDropdown && searchResults.length > 0}
					<div class="absolute top-[52px] left-0 right-0 bg-white border border-gray-200 rounded-[20px] shadow-lg z-50 max-h-[400px] overflow-y-auto">
						<div class="p-[16px]">
							<h3 class="font-[Satoshi] text-[14px] font-semibold text-gray-600 mb-[12px] uppercase tracking-wide">
								Search Results ({searchResults.length})
							</h3>
							<div class="space-y-[8px]">
								{#each searchResults as product}
									<button
										onclick={() => handleProductSelect(product.id.toString())}
										class="w-full flex items-center gap-[12px] p-[12px] rounded-[12px] hover:bg-gray-50 transition-colors text-left"
									>
										<div class="w-[48px] h-[48px] bg-[#F0F0F0] rounded-[8px] overflow-hidden flex-shrink-0">
											<img 
												src={product.image} 
												alt={product.name}
												class="w-full h-full object-cover"
											/>
										</div>
										<div class="flex-1 min-w-0">
											<h4 class="font-[Satoshi] text-[14px] font-medium text-black truncate">
												{product.name}
											</h4>
											<p class="font-[Satoshi] text-[12px] text-gray-500 capitalize">
												{product.category}
											</p>
											<p class="font-[Satoshi] text-[14px] font-bold text-black">
												{product.price}
											</p>
										</div>
										<i class="fa-regular fa-arrow-right text-[12px] text-gray-400"></i>
									</button>
								{/each}
							</div>
							
							{#if searchQuery.trim()}
								<div class="mt-[12px] pt-[12px] border-t border-gray-100">
									<button
										onclick={() => handleSearchSubmit(new Event('submit'))}
										class="w-full flex items-center justify-center gap-[8px] p-[12px] bg-black text-white rounded-[12px] hover:bg-gray-800 transition-colors"
									>
										<i class="fa-regular fa-magnifying-glass text-[14px]"></i>
										<span class="font-[Satoshi] text-[14px] font-medium">
											View all results for "{searchQuery}"
										</span>
									</button>
								</div>
							{/if}
						</div>
					</div>
				{/if}
			</div>
			
			<div class="flex gap-[24px]">
				<!-- Cart Icon with Badge -->
				<button 
					onclick={handleCartClick}
					class="relative hover:text-gray-600 transition-colors"
					aria-label="Cart"
				>
					<i class="fa-regular fa-cart-shopping text-[18px] font-normal text-black"></i>
					{#if getCartState().length > 0}
						<div class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
							{getCartState().reduce((sum, item) => sum + item.quantity, 0) > 99 ? '99+' : getCartState().reduce((sum, item) => sum + item.quantity, 0)}
						</div>
					{/if}
				</button>
				<a aria-label="User" href="/" class="hover:text-gray-600 transition-colors">
					<i class="fa-regular fa-user text-[18px] font-normal text-black"></i>
				</a>
				<div class="flex gap-2 items-center">
					<div class="h-2 w-2 bg-green-400 rounded-full"></div>
					<span class="font-[Satoshi] text-[14px] font-normal text-black">{liveUsers}</span>
					<div class="font-[Satoshi] text-[14px] font-normal text-black">
						users live
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Cart Dropdown -->
{#if showCartDropdown}
	<CartDropdown onClose={handleCartDropdownClose} />
{/if}