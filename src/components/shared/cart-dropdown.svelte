<script lang="ts">
	import { getCartState, removeFromCart, updateQuantity } from '$lib/hooks/cart.svelte'
	import { goto } from '$app/navigation';

	interface Props {
		onClose: () => void;
	}

	let {  onClose }: Props = $props();

	// Handle quantity update
	const handleQuantityUpdate = (itemId: string, newQuantity: number) => {
		if (newQuantity <= 0) {
			removeFromCart(itemId);
			return;
		}
		updateQuantity(itemId, newQuantity);
	};

	// Handle view cart
	const handleViewCart = () => {
		onClose();
		goto('/checkout');
	};

	// Handle checkout
	const handleCheckout = () => {
		onClose();
		goto('/checkout');
	};

	// Add event listeners
	
</script>
	<div class="cart-dropdown-container fixed inset-0 z-50">
		<!-- Backdrop -->
		<div aria-label="Close cart dropdown" aria-hidden="true" class="absolute inset-0 bg-black/50 bg-opacity-25" onclick={onClose}></div>
		
		<!-- Dropdown -->
		<div class="absolute top-[95px] right-[15px] w-[400px] max-h-[600px] bg-white rounded-[20px] shadow-xl border border-gray-200 overflow-hidden max-md:w-[calc(100vw-30px)] max-md:right-[15px]">
			<!-- Header -->
			<div class="flex items-center justify-between p-4 border-b border-gray-100">
				<h3 class="font-[Satoshi] text-[18px] font-bold text-black">
					Shopping Cart ({getCartState().length} item{getCartState().length !== 1 ? 's' : ''})
				</h3>
				<button
					aria-label="Close cart dropdown"
					onclick={onClose}
					class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
				>
					<i class="fa-regular fa-times text-gray-500"></i>
				</button>
			</div>

			<!-- Cart Items -->
			<div class="flex-1 overflow-y-auto max-h-[400px]">
				{#if getCartState().length === 0}
					<div class="p-6 text-center">
						<i class="fa-regular fa-cart-shopping text-4xl text-gray-300 mb-3"></i>
						<p class="font-[Satoshi] text-[16px] text-gray-500">Your cart is empty</p>
					</div>
				{:else}
					<div class="p-4 space-y-3">
						{#each getCartState() as item}
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-2">
									<img src={item.image} alt={item.name} class="w-10 h-10 rounded-full" />
									<p class="font-[Satoshi] text-[16px] font-bold text-black">{item.name}</p>
								</div>
								<div class="flex items-center gap-2">
									<button onclick={() => handleQuantityUpdate(item.id, item.quantity - 1)} class="text-3xl font-light text-black">−</button>
									<span class="text-base font-medium text-black">{item.quantity}</span>
									<button onclick={() => handleQuantityUpdate(item.id, item.quantity + 1)} class="text-3xl font-light text-black">+</button>
									<button
										aria-label="Remove item"
									onclick={() => removeFromCart(item.id)} class="text-lg font-light text-red-500">
										<i class="fa-solid fa-trash"></i>
									</button>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Footer -->
			{#if getCartState().length > 0}
				<div class="border-t border-gray-100 p-4">
					<!-- Total -->
					<div class="flex items-center justify-between mb-4">
						<span class="font-[Satoshi] text-[16px] font-bold text-black">Total:</span>
						<span class="font-[Satoshi] text-[20px] font-bold text-black">${getCartState().reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</span>
					</div>

					<!-- Action Buttons -->
					<div class="flex gap-3">
						<button
							onclick={handleViewCart}
							class="flex-1 h-[44px] flex items-center justify-center gap-2 rounded-[12px] border border-black px-4 py-2 font-[Satoshi] text-[14px] font-medium text-black hover:bg-gray-50 transition-colors"
						>
							<i class="fa-regular fa-eye"></i>
							View Cart
						</button>
						<button
							onclick={handleCheckout}
							class="flex-1 h-[44px] flex items-center justify-center gap-2 rounded-[12px] bg-black px-4 py-2 font-[Satoshi] text-[14px] font-medium text-white hover:bg-gray-800 transition-colors"
						>
							<i class="fa-regular fa-credit-card"></i>
							Checkout
						</button>
					</div>
				</div>
			{:else}
				<div class="border-t border-gray-100 p-4">
					<button
						onclick={() => { onClose(); goto('/category?page=1'); }}
						class="w-full h-[44px] flex items-center justify-center gap-2 rounded-[12px] bg-black px-4 py-2 font-[Satoshi] text-[14px] font-medium text-white hover:bg-gray-800 transition-colors"
					>
						<i class="fa-regular fa-shopping-bag"></i>
						Start Shopping
					</button>
				</div>
			{/if}
		</div>
	</div>