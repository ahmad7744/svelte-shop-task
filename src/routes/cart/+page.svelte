<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Header from "../../components/global/header.svelte";
	import Discount from "../../components/shared/discount.svelte";
	import Footer from "../../components/global/footer.svelte";
	import NewsLetter from "../../components/shared/news-letter.svelte";
	import { getCartState, removeFromCart, updateQuantity, clearCart } from '$lib/hooks/cart.svelte'

	// Optimistic updates state
	let optimisticRemovals = $state<Set<string>>(new Set());
	let operationIds = $state<Map<string, string>>(new Map());

	// Handle quantity update
	const handleQuantityUpdate = (itemId: string, newQuantity: number) => {
		if (newQuantity <= 0) {
			handleRemoveItem(itemId);
			return;
		}
		
		updateQuantity(itemId, newQuantity);
	};

	// Handle item removal with optimistic update
	const handleRemoveItem = (itemId: string) => {
		// Optimistically remove item from UI
		optimisticRemovals.add(itemId);
		
		// Actually remove item (will be processed by queue)
		removeFromCart(itemId);
		
		// Remove from optimistic removals after operation completes
		setTimeout(() => {
			optimisticRemovals.delete(itemId);
		}, 1000);
	};

	// Handle clear cart
	const handleClearCart = () => {
		clearCart();
		optimisticRemovals.clear();
		operationIds.clear();
	};

	// Handle checkout
	const handleCheckout = () => {
		goto('/checkout');
	};

	// Get visible items (excluding optimistically removed ones)
	const getVisibleItems = () => {
		return getCartState().filter(item => !optimisticRemovals.has(item.id));
	};

	// Calculate visible total
	const getVisibleTotal = () => {
		const visibleItems = getVisibleItems();
		return visibleItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
	};

	const visibleItems = $derived(getVisibleItems());
	const visibleTotal = $derived(getVisibleTotal());
	const visibleItemCount = $derived(visibleItems.reduce((sum, item) => sum + item.quantity, 0));
</script>

<Discount />
<Header />

<div class="container m-auto w-full max-w-[1240px] pr-[15px] pl-[15px]">
	<div class="categories-body mb-[80px] w-full border-t border-gray-300 pt-[25px]">
		<div class="breadcrumb mb-[25px] flex items-center gap-[8px]">
			<a href="/" class="font-[Satoshi] text-[16px] leading-[22px] font-normal text-black/60 hover:text-black">Home</a>
			<span><i class="fa-regular fa-angle-right text-black/60"></i></span>
			<p class="font-[Satoshi] text-[16px] leading-[22px] font-normal text-black">Cart</p>
		</div>
		<h2 class="font-[League Spartan] mb-[15px] text-[40px] font-bold text-black uppercase max-lg:mb-[10px] max-lg:text-[32px]">
			Your cart
		</h2>
		<div class="grid grid-cols-12 gap-6">
			<div class="col-span-12 lg:col-span-7">
				<div class="cart-box box-border flex w-full flex-col items-start gap-[24px] rounded-[20px] border border-[rgba(0,0,0,0.1)] p-[20px_24px]">
					{#if visibleItems.length === 0}
						<div class="text-center py-12 w-full">
							<i class="fa-regular fa-cart-shopping text-6xl text-gray-300 mb-4"></i>
							<h3 class="font-[Satoshi] text-[24px] font-bold text-gray-600 mb-2">Your cart is empty</h3>
							<p class="font-[Satoshi] text-[16px] text-gray-500 mb-6">Add some products to get started</p>
							<a
								href="/category?page=1"
								class="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-[12px] font-[Satoshi] font-medium hover:bg-gray-800 transition-colors"
							>
								<i class="fa-regular fa-shopping-bag"></i>
								Continue Shopping
							</a>
						</div>
					{:else}
						{#each visibleItems as item (item.id)}
							<div class="product-list w-full border-b border-gray-300 pb-[25px] relative">
								<!-- Optimistic removal overlay -->
								{#if optimisticRemovals.has(item.id)}
									<div class="absolute inset-0 bg-red-50 bg-opacity-90 rounded-[12px] flex items-center justify-center z-10">
										<div class="flex items-center gap-2 text-red-600">
											<div class="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
											<span class="font-[Satoshi] font-medium">Removing...</span>
										</div>
									</div>
								{/if}

								<div class="grid grid-cols-12 gap-6 max-md:gap-3">
									<div class="col-span-3">
										<div class="h-[130px] w-[100%] flex-none flex-grow-0 overflow-hidden rounded-[8.65772px] bg-[#F0EEED] max-md:h-[100px]">
											<img src={item.image} class="h-[100%] w-[100%] object-cover" alt={item.name} />
										</div>
									</div>
									<div class="col-span-9">
										<div class="flex justify-between max-md:flex-col">
											<div>
												<h4 class="text-[20px] font-[600] text-black">{item.name}</h4>
												<div class="flex flex-col">
													<p class="mt-[5px] text-[14px] leading-[19px] font-normal text-black">
														Category: <span class="text-gray-500 capitalize">{item.category}</span>
													</p>
													<h6 class="mt-[15px] text-[24px] font-bold text-black">${item.price.toFixed(2)}</h6>
												</div>
											</div>
											<div class="flex h-auto flex-col items-end justify-between max-md:flex-row max-md:items-center max-md:justify-between">
												<button
													aria-label="Remove item"
													onclick={() => handleRemoveItem(item.id)}
													class="text-red-500 hover:text-red-700 transition-colors p-2"
													title="Remove item"
												>
													<i class="fa-solid fa-trash text-[22px]"></i>
												</button>
												<div>
													<div class="flex h-[48px] w-[125px] items-center justify-center gap-6 rounded-full bg-[#F0F0F0]">
														<button 
															onclick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
															class="text-3xl font-light text-black hover:text-gray-600 transition-colors"
														>
															−
														</button>
														<span class="text-base font-medium text-black">{item.quantity}</span>
														<button 
															onclick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
															class="text-3xl font-light text-black hover:text-gray-600 transition-colors"
														>
															+
														</button>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						{/each}

						<!-- Clear Cart Button -->
						{#if visibleItems.length > 0}
							<div class="w-full pt-4 border-t border-gray-200">
								<button
									onclick={handleClearCart}
									class="text-red-600 hover:text-red-800 transition-colors font-[Satoshi] text-[14px] font-medium"
								>
									<i class="fa-regular fa-trash mr-2"></i>
									Clear Cart
								</button>
							</div>
						{/if}
					{/if}
				</div>
			</div>

			<!-- Cart Summary -->
			<div class="col-span-12 lg:col-span-5">
				<div class="cart-summary box-border flex w-full flex-col items-start gap-[24px] rounded-[20px] border border-[rgba(0,0,0,0.1)] p-[20px_24px]">
					<h3 class="font-[Satoshi] text-[24px] font-bold text-black">Order Summary</h3>
					
					{#if visibleItems.length > 0}
						<div class="w-full space-y-4">
							<!-- Items -->
							<div class="space-y-2">
								{#each visibleItems as item}
									<div class="flex justify-between items-center">
										<span class="font-[Satoshi] text-[14px] text-gray-600">
											{item.name} × {item.quantity}
										</span>
										<span class="font-[Satoshi] text-[14px] font-bold text-black">
											${(item.price * item.quantity).toFixed(2)}
										</span>
									</div>
								{/each}
							</div>

							<!-- Divider -->
							<div class="border-t border-gray-200 pt-4"></div>

							<!-- Total -->
							<div class="flex justify-between items-center">
								<span class="font-[Satoshi] text-[18px] font-bold text-black">Total</span>
								<span class="font-[Satoshi] text-[24px] font-bold text-black">${visibleTotal.toFixed(2)}</span>
							</div>

							<!-- Promo Code Input -->
							<div class="mt-[25px] flex gap-[10px]">
								<div class="flex w-[70%] items-center gap-2 rounded-full bg-[#F0F0F0] px-6 py-2 max-md:py-1">
									<i class="fa-regular fa-tag text-2xl text-gray-400"></i>
									<input
										type="text"
										placeholder="Add promo code"
										class="flex-grow border-0 bg-transparent text-lg text-gray-700 focus:outline-none"
									/>
								</div>
								<button class="flex w-[30%] items-center justify-center rounded-full bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 transition-colors">
									Apply
								</button>
							</div>

							<!-- Checkout Button -->
							<button
								onclick={handleCheckout}
								class="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-black py-3 text-white hover:bg-gray-800 transition-colors"
							>
								Go to Checkout
								<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
									<path d="M5 12h14M13 6l6 6-6 6" />
								</svg>
							</button>
						</div>
					{:else}
						<div class="text-center py-8 w-full">
							<p class="font-[Satoshi] text-[16px] text-gray-500 mb-4">No items in cart</p>
							<a
								href="/category?page=1"
								class="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-[12px] font-[Satoshi] font-medium hover:bg-gray-800 transition-colors"
							>
								<i class="fa-regular fa-shopping-bag"></i>
								Start Shopping
							</a>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

<div class="relative container m-auto mb-[-100px] w-full max-w-[1240px] pr-[15px] pl-[15px]">
	<div class="mx-auto flex min-h-[180px] w-[100%] items-center justify-between gap-[153px] rounded-[20px] bg-black px-[64px] py-[36px] max-md:p-[25px]">
		<div class="grid grid-cols-12 gap-6 max-md:gap-2">
			<div class="col-span-12 lg:col-span-7">
				<h3 class="font-[League Spartan] text-[48px] font-bold text-white max-xl:text-[36px] max-md:text-[28px]">
					STAY UPTO DATE ABOUT OUR LATEST OFFERS
				</h3>
			</div>
			<div class="col-span-12 lg:col-span-1"></div>
			<div class="col-span-12 flex h-[100%] flex-col items-center justify-center lg:col-span-4">
				<div class="search-bar relative mb-[15px] w-[100%]">
					<input
						type="text"
						class="order-2 h-[48px] w-[100%] flex-none grow gap-[12px] rounded-[62px] border-0 bg-[#F0F0F0] p-[12px_16px] pl-[50px]"
						placeholder="Search for products..."
					/>
					<i class="fa-regular fa-magnifying-glass absolute top-[15px] left-[20px] z-10 text-[18px] text-[#00000071]"></i>
				</div>
				<button class="flex h-[46px] w-[100%] items-center justify-center gap-[12px] rounded-[62px] border-0 bg-white px-[16px] py-[12px]">
					<span class="font-[Satoshi] text-[16px] leading-[22px] font-medium text-black">
						Subscribe to Newsletter
					</span>
				</button>
			</div>
		</div>
	</div>
</div>

<NewsLetter />
<Footer />
