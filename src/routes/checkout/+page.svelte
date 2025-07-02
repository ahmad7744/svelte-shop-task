<script lang="ts">
	import { onMount } from 'svelte';
	import Header from "../../components/global/header.svelte";
	import Discount from "../../components/shared/discount.svelte";
	import Footer from "../../components/global/footer.svelte";
	import NewsLetter from "../../components/shared/news-letter.svelte";
	import { getCartState, removeFromCart, updateQuantity, clearCart } from '$lib/hooks/cart.svelte'
	import { checkoutService } from '$lib/services/checkout';
	
	// Reactive checkout state
	let checkoutState = $state(checkoutService.getState());
	let unsubscribe: (() => void) | null = null;

	// Success message state
	let successMessage = $state<string>('');
	let showSuccessMessage = $state(false);

	// Subscribe to checkout state changes
	onMount(() => {
		unsubscribe = checkoutService.subscribe(() => {
			checkoutState = checkoutService.getState();
		});
	});

	// Handle quantity update with optimistic update
	const handleQuantityUpdate = (itemId: string, newQuantity: number) => {
		if (newQuantity <= 0) {
			handleRemoveItem(itemId);
			return;
		}
		updateQuantity(itemId, newQuantity);
	};

	// Handle item removal with optimistic update
	const handleRemoveItem = (itemId: string) => {
		removeFromCart(itemId);
	};

	// Handle clear cart with optimistic update
	const handleClearCart = () => {
		clearCart();
	};
	// Handle checkout
	const handleCheckout = async () => {
		const result = await checkoutService.processCheckout(getCartState(), visibleTotal);
		
		if (result.success) {
			successMessage = result.message;
			showSuccessMessage = true;
			
			handleClearCart();
			
			setTimeout(() => {
				showSuccessMessage = false;
				successMessage = '';
			}, 5000);
		} else {
			successMessage = result.message;
			showSuccessMessage = true;
			
			setTimeout(() => {
				showSuccessMessage = false;
				successMessage = '';
			}, 3000);
		}
	};

	// Calculate visible total
	const getVisibleTotal = (): number => {
		return getCartState().reduce((sum, item) => sum + (item.price * item.quantity), 0);
	};

	const visibleItems = $derived(getCartState());
	const visibleTotal = $derived(getVisibleTotal());
	const visibleItemCount = $derived(visibleItems.reduce((sum, item) => sum + item.quantity, 0));
</script>

<svelte:head>
	<title>Checkout - Your Cart</title>
	<meta name="description" content="Review and checkout your cart items" />
</svelte:head>

<Discount />
<Header />

<div class="container m-auto w-full max-w-[1240px] pr-[15px] pl-[15px]">
	<div class="checkout-body mb-[80px] w-full border-t border-gray-300 pt-[25px]">
		<!-- Breadcrumb -->
		<div class="breadcrumb mb-[25px] flex items-center gap-[8px]">
			<a href="/" class="font-[Satoshi] text-[16px] leading-[22px] font-normal text-black/60 hover:text-black">Home</a>
			<span><i class="fa-regular fa-angle-right"></i></span>
			<p class="font-[Satoshi] text-[16px] leading-[22px] font-normal text-black">Checkout</p>
		</div>

		<!-- Success/Error Message -->
		{#if showSuccessMessage}
			<div class="mb-6 p-4 rounded-[12px] {successMessage.includes('Successfully') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}">
				<div class="flex items-center gap-3">
					{#if successMessage.includes('Successfully')}
						<i class="fa-regular fa-check-circle text-green-600 text-xl"></i>
					{:else}
						<i class="fa-regular fa-exclamation-triangle text-red-600 text-xl"></i>
					{/if}
					<p class="font-[Satoshi] text-[16px] font-medium {successMessage.includes('Successfully') ? 'text-green-800' : 'text-red-800'}">
						{successMessage}
					</p>
				</div>
			</div>
		{/if}

		<div class="grid grid-cols-12 gap-8">
			<!-- Cart Items -->
			<div class="col-span-12 lg:col-span-8">
				<div class="bg-white rounded-[20px] border border-gray-200 p-6">
					<div class="flex items-center justify-between mb-6">
						<h2 class="font-[Satoshi] text-[28px] font-bold text-black">
							Your Cart ({visibleItemCount} item{visibleItemCount !== 1 ? 's' : ''})
						</h2>
						{#if visibleItems.length > 0}
							<button
								onclick={handleClearCart}
								class="font-[Satoshi] text-[14px] text-red-600 hover:text-red-800 transition-colors flex items-center gap-2"
							>
								<i class="fa-regular fa-trash"></i>
								Clear Cart
							</button>
						{/if}
					</div>

					{#if visibleItems.length === 0}
						<div class="text-center py-12">
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
						<div class="space-y-4">
							{#each getCartState() as item (item.id)}
								<div class="flex items-center gap-4 p-4 border border-gray-100 rounded-[12px] relative transition-all duration-200 hover:shadow-md">
									<!-- Product Image -->
									<div class="w-20 h-20 bg-[#F0F0F0] rounded-[8px] overflow-hidden flex-shrink-0">
										<img 
											src={item.image} 
											alt={item.name}
											class="w-full h-full object-cover"
										/>
									</div>

									<!-- Product Details -->
									<div class="flex-1 min-w-0">
										<h4 class="font-[Satoshi] text-[18px] font-bold text-black truncate mb-1">
											{item.name}
										</h4>
										<p class="font-[Satoshi] text-[14px] text-gray-500 capitalize mb-2">
											{item.category}
										</p>
										<p class="font-[Satoshi] text-[16px] font-bold text-black">
											${item.price.toFixed(2)}
										</p>
									</div>

									<!-- Quantity Controls -->
									<div class="flex items-center gap-3">
										<button
											aria-label="Decrease quantity"
											onclick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
											class="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
											disabled={item.quantity <= 1}
										>
											<i class="fa-regular fa-minus text-sm"></i>
										</button>
										<span class="font-[Satoshi] font-bold text-[16px] min-w-[2rem] text-center">
											{item.quantity}
										</span>
										<button
											aria-label="Increase quantity"
											onclick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
											class="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
										>
											<i class="fa-regular fa-plus text-sm"></i>
										</button>
									</div>

									<!-- Item Total -->
									<div class="text-right min-w-[80px]">
										<p class="font-[Satoshi] text-[18px] font-bold text-black">
											${(item.price * item.quantity).toFixed(2)}
										</p>
									</div>

									<!-- Remove Button -->
									<button
										aria-label="Remove item"
										onclick={() => handleRemoveItem(item.id)}
										class="text-red-500 hover:text-red-700 transition-colors p-2 rounded-full hover:bg-red-50"
										title="Remove item"
									>
										<i class="fa-regular fa-trash text-lg"></i>
									</button>

								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<!-- Order Summary -->
			<div class="col-span-12 lg:col-span-4">
				<div class="bg-white rounded-[20px] border border-gray-200 p-6 sticky top-6">
					<h3 class="font-[Satoshi] text-[24px] font-bold text-black mb-6">Order Summary</h3>
					
					<div class="space-y-4 mb-6">
						<div class="flex justify-between">
							<span class="font-[Satoshi] text-[16px] text-gray-600">Subtotal</span>
							<span class="font-[Satoshi] text-[16px] font-bold text-black">${visibleTotal.toFixed(2)}</span>
						</div>
						<div class="flex justify-between">
							<span class="font-[Satoshi] text-[16px] text-gray-600">Shipping</span>
							<span class="font-[Satoshi] text-[16px] font-bold text-green-600">Free</span>
						</div>
						<div class="border-t border-gray-200 pt-4">
							<div class="flex justify-between">
								<span class="font-[Satoshi] text-[20px] font-bold text-black">Total</span>
								<span class="font-[Satoshi] text-[20px] font-bold text-black">${visibleTotal.toFixed(2)}</span>
							</div>
						</div>
					</div>

					<!-- Checkout Button -->
					<button
						onclick={handleCheckout}
						disabled={visibleItems.length === 0 || !checkoutState.canCheckout || checkoutState.isProcessing}
						class="w-full bg-black text-white py-4 px-6 rounded-[12px] font-[Satoshi] text-[16px] font-bold hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
					>
						{#if checkoutState.isProcessing}
							<div class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
							Processing...
						{:else if !checkoutState.canCheckout && checkoutState.cooldownRemaining > 0}
							<i class="fa-regular fa-clock"></i>
							Wait {checkoutState.cooldownRemaining}s
						{:else if visibleItems.length === 0}
							Cart is Empty
						{:else}
							<i class="fa-regular fa-credit-card"></i>
							Checkout ${visibleTotal.toFixed(2)}
						{/if}
					</button>

					<!-- Rate Limit Info -->
					{#if !checkoutState.canCheckout && checkoutState.cooldownRemaining > 0}
						<div class="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-[8px]">
							<div class="flex items-center gap-2 text-orange-700">
								<i class="fa-regular fa-info-circle"></i>
								<p class="font-[Satoshi] text-[14px]">
									Rate limit: Please wait {checkoutState.cooldownRemaining} seconds before your next checkout.
								</p>
							</div>
						</div>
					{/if}

					<!-- Continue Shopping -->
					<a
						href="/category?page=1"
						class="block w-full text-center mt-4 py-3 px-6 border border-gray-300 rounded-[12px] font-[Satoshi] text-[16px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
					>
						Continue Shopping
					</a>
				</div>
			</div>
		</div>
	</div>
</div>

<NewsLetter />
<Footer /> 