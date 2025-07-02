<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Discount from '../../../components/shared/discount.svelte';
	import Header from '../../../components/global/header.svelte';
	import Footer from '../../../components/global/footer.svelte';
	import NewsLetter from '../../../components/shared/news-letter.svelte';
	import ReviewCard from '../../../components/shared/review-card.svelte';
	import ProductCard from '../../../components/shared/product-card.svelte';
	import { useProducts } from '$lib/hooks/useProducts';
	import { addToCart, isInCart, getQuantity, getOperationStatus } from '$lib/hooks/cart.svelte'
	import type { ProductForUI } from '$lib/api/products';
	// Get the product hook
	const { loadProductById, uiProductsStore } = useProducts();


	// Product state
	let product: ProductForUI | null = $state(null);
	let relatedProducts: ProductForUI[] = $state([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let quantity = $state(1);

	// Cart operation state
	let lastOperationId = $state<string | null>(null);
	let showSuccessMessage = $state(false);
	let isAddingToCart = $state(false);
	let operationStatus = $state<'idle' | 'adding' | 'added' | 'error'>('idle');

	// Get product ID from URL
	const getProductId = () => {
		return parseInt($page.params.id, 10);
	};

	// Calculate discounted price (original price + 30%)
	const getDiscountedPrice = (currentPrice: string) => {
		const price = parseFloat(currentPrice.replace('$', ''));
		const discountedPrice = price + (price * 0.30);
		return `$${discountedPrice.toFixed(2)}`;
	};

	// Generate star display
	const generateStars = (rating: string) => {
		const ratingNum = parseFloat(rating);
		const fullStars = Math.floor(ratingNum);
		const hasHalfStar = ratingNum % 1 >= 0.5;
		const emptyStars = 5 - Math.ceil(ratingNum);
		
		return {
			full: fullStars,
			half: hasHalfStar,
			empty: emptyStars
		};
	};

	// Mock reviews data (since the API doesn't provide reviews)
	const mockReviews = [
		{
			rating: 5,
			userName: "Sarah M.",
			userVerified: true,
			reviewText: "I'm blown away by the quality and style of the clothes I received from Shop.co. From casual wear to elegant dresses, every piece I've bought has exceeded my expectations.",
			reviewDate: "August 14, 2023"
		},
		{
			rating: 4,
			userName: "Alex K.",
			userVerified: true,
			reviewText: "Finding clothes that align with my personal style used to be a challenge until I discovered Shop.co. The range of options they offer is truly remarkable.",
			reviewDate: "August 15, 2023"
		},
		{
			rating: 5,
			userName: "James L.",
			userVerified: false,
			reviewText: "As someone who's always on the lookout for unique fashion pieces, I'm thrilled to have stumbled upon Shop.co. The selection of clothes is not only diverse but also on-point with the latest trends.",
			reviewDate: "August 16, 2023"
		},
		{
			rating: 4,
			userName: "Mooen",
			userVerified: true,
			reviewText: "Shop.co has completely transformed my wardrobe. The quality of their clothes is exceptional, and the variety ensures that I can find something for every occasion.",
			reviewDate: "August 17, 2023"
		}
	];

	// Quantity handlers
	const increaseQuantity = () => {
		quantity += 1;
	};

	const decreaseQuantity = () => {
		if (quantity > 1) {
			quantity -= 1;
		}
	};

	// Handle add to cart with queue status tracking
	const handleAddToCart = async () => {
		if (!product || isAddingToCart) return;

		isAddingToCart = true;
		operationStatus = 'adding';

		try {
			// Add to cart using hook and get operation ID
			const operationId = addToCart(product, quantity);
			lastOperationId = operationId;

			// Monitor operation status
			const checkStatus = () => {
				const status = getOperationStatus(operationId);
				
				if (status) {
					if (status.status === 'completed') {
						operationStatus = 'added';
						showSuccessMessage = true;
						setTimeout(() => {
							operationStatus = 'idle';
							showSuccessMessage = false;
						}, 2000);
					} else if (status.status === 'failed') {
						operationStatus = 'error';
						setTimeout(() => {
							operationStatus = 'idle';
						}, 3000);
					} else {
						// Still processing, check again
						setTimeout(checkStatus, 100);
					}
				} else {
					// Operation not found, assume completed
					operationStatus = 'added';
					showSuccessMessage = true;
					setTimeout(() => {
						operationStatus = 'idle';
						showSuccessMessage = false;
					}, 2000);
				}
			};

			// Start monitoring
			setTimeout(checkStatus, 100);

		} catch (error) {
			console.error('Error adding to cart:', error);
			operationStatus = 'error';
			setTimeout(() => {
				operationStatus = 'idle';
			}, 3000);
		} finally {
			isAddingToCart = false;
		}
	};

	// Load product data
	const loadProduct = async () => {
		try {
			loading = true;
			error = null;
			const productId = getProductId();
			
			if (isNaN(productId)) {
				throw new Error('Invalid product ID');
			}

			const productData = await loadProductById(productId);
			product = productData;

			// Get related products from the same category
			const allProducts = $uiProductsStore.allProducts;
			relatedProducts = allProducts
				.filter(p => p.category === productData.category && p.id !== productData.id)
				.slice(0, 4);

		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load product';
		} finally {
			loading = false;
		}
	};

	// Load product on mount and when ID changes
	onMount(() => {
		loadProduct();
	});

	// Watch for ID changes
	$effect(() => {
		const currentId = getProductId();
		if (product && product.id.toString() !== currentId.toString()) {
			loadProduct();
		}
	});

	// Check if product is in cart
	const productInCart = $derived(product ? isInCart((product as any).id) : false);
	const cartQuantity = $derived(product ? getQuantity((product as any).id) : 0);

	// Get button text based on operation status
	const getButtonText = $derived(() => {
		switch (operationStatus) {
			case 'adding':
				return 'Adding to cart...';
			case 'added':
				return 'Added!';
			case 'error':
				return 'Error - Try Again';
			default:
				return productInCart ? 'Add More to Cart' : 'Add to Cart';
		}
	});

	// Get button disabled state
	const isButtonDisabled = $derived(isAddingToCart || operationStatus === 'adding');

	// Get button styling based on status
	const getButtonClasses = $derived(() => {
		const baseClasses = "flex h-[48px] w-[70%] items-center justify-center gap-[12px] rounded-[62px] px-[54px] py-[16px] font-[Satoshi] text-[14px] leading-[19px] font-medium transition-colors";
		
		switch (operationStatus) {
			case 'adding':
				return `${baseClasses} bg-gray-600 text-white cursor-not-allowed`;
			case 'added':
				return `${baseClasses} bg-green-600 text-white hover:bg-green-700`;
			case 'error':
				return `${baseClasses} bg-red-600 text-white hover:bg-red-700`;
			default:
				return `${baseClasses} bg-black text-white hover:bg-gray-800`;
		}
	});
</script>

<Discount />
<Header />

<div class="container m-auto w-full max-w-[1240px] pr-[15px] pl-[15px]">
	<div class="categories-body mb-[80px] w-full border-t border-gray-300 pt-[25px]">
		<!-- Breadcrumb -->
		<div class="breadcrumb mb-[25px] flex items-center gap-[8px]">
			<a href="/" class="font-[Satoshi] text-[16px] leading-[22px] font-normal text-black/60 hover:text-black">Home</a>
			<span><i class="fa-regular fa-angle-right text-black/60"></i></span>
			<a href="/category" class="font-[Satoshi] text-[16px] leading-[22px] font-normal text-black/60 hover:text-black">Shop</a>
			<span><i class="fa-regular fa-angle-right text-black/60"></i></span>
			{#if product}
				<a href="/category?category={product.category}" class="font-[Satoshi] text-[16px] leading-[22px] font-normal text-black/60 hover:text-black capitalize">{product.category}</a>
				<span><i class="fa-regular fa-angle-right text-black/60"></i></span>
				<p class="font-[Satoshi] text-[16px] leading-[22px] font-normal text-black">{product.name}</p>
			{/if}
		</div>

		{#if loading}
			<!-- Loading State -->
			<div class="flex items-center justify-center py-20">
				<div class="animate-spin h-12 w-12 border-4 border-black border-t-transparent rounded-full"></div>
			</div>
		{:else if error}
			<!-- Error State -->
			<div class="text-center py-20">
				<i class="fa-regular fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
				<h2 class="font-[Satoshi] text-[24px] font-bold text-black mb-2">Error Loading Product</h2>
				<p class="font-[Satoshi] text-[16px] text-gray-600 mb-6">{error}</p>
				<button 
					onclick={loadProduct}
					class="bg-black text-white px-6 py-3 rounded-[12px] font-[Satoshi] font-medium hover:bg-gray-800 transition-colors"
				>
					Try Again
				</button>
			</div>
		{:else if product}
			<!-- Product Content -->
			<div class="grid grid-cols-12 gap-6">
				<!-- Product Images -->
				<div class="col-span-12 md:col-span-6">
					<div class="grid grid-cols-12 gap-[20px]">
						<div class="col-span-4">
							<div class="flex flex-col gap-[15px]">
								{#each Array(3) as _, index}
									<div class="h-[168px] w-[100%] overflow-hidden rounded-[20px] bg-[#F0EEED] max-lg:h-[130px] max-lg:rounded-[12px] max-md:h-[110px]">
										<img src={product.image} class="h-[100%] w-[100%] object-cover" alt={product.name} />
									</div>
								{/each}
							</div>
						</div>
						<div class="col-span-8">
							<div class="h-[530px] w-[100%] overflow-hidden rounded-[20px] bg-[#F0EEED] max-lg:h-[425px] max-md:h-[360px]">
								<img src={product.image} class="h-[100%] w-[100%] object-cover" alt={product.name} />
							</div>
						</div>
					</div>
				</div>

				<!-- Product Details -->
				<div class="col-span-12 md:col-span-6">
					<h2 class="font-[League Spartan] mb-[15px] text-[40px] font-bold text-black uppercase max-md:text-[30px]">
						{product.name}
					</h2>
					
					<!-- Rating -->
					<div class="stars mb-[15px] flex items-center gap-[5px]">
						{#if product}
							{@const stars = generateStars(product.rating)}
							{#each Array(stars.full) as _}
								<i class="fa-solid fa-star text-[16px] text-[#FFC633]"></i>
							{/each}
							{#if stars.half}
								<i class="fa-solid fa-star-half-stroke text-[16px] text-[#FFC633]"></i>
							{/if}
							{#each Array(stars.empty) as _}
								<i class="fa-regular fa-star text-[16px] text-[#FFC633]"></i>
							{/each}
							<span class="font-[Satoshi] text-[16px] leading-[19px] font-normal text-black">
								{product.rating}/5
							</span>
						{/if}
					</div>

					<!-- Price -->
					<h6 class="mb-[15px] flex items-center font-[Satoshi] text-[24px] font-bold text-black">
						{product.price}
						<del class="ml-[10px] font-[Satoshi] text-[24px] leading-[32px] font-bold text-gray-400">
							{getDiscountedPrice(product.price)}
						</del>
					</h6>

					<!-- Description -->
					<p class="mb-[15px] font-[Satoshi] text-[16px] leading-[22px] font-normal text-black/60">
						{product.description}
					</p>

					<!-- Cart Status -->
					{#if productInCart}
						<div class="mb-[15px] p-3 bg-green-50 border border-green-200 rounded-[12px]">
							<div class="flex items-center gap-2 text-green-700">
								<i class="fa-regular fa-check-circle"></i>
								<span class="font-[Satoshi] text-[14px] font-medium">
									In cart ({cartQuantity} item{cartQuantity !== 1 ? 's' : ''})
								</span>
							</div>
						</div>
					{/if}
					<!-- Quantity and Add to Cart -->
					<div class="mt-[30px] border-t border-black/10 pt-[24px]">
						<div class="flex gap-[20px]">
							<div class="flex h-[48px] w-[30%] items-center justify-center gap-6 rounded-full bg-[#F0F0F0]">
								<button onclick={decreaseQuantity} class="text-3xl font-light text-black">−</button>
								<span class="text-base font-medium text-black">{quantity}</span>
								<button onclick={increaseQuantity} class="text-3xl font-light text-black">+</button>
							</div>

							<button 
								onclick={handleAddToCart}
								disabled={isButtonDisabled}
								class={getButtonClasses()}
							>
								{#if operationStatus === 'adding'}
									<div class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
								{:else if operationStatus === 'added'}
									<i class="fa-regular fa-check"></i>
								{:else if operationStatus === 'error'}
									<i class="fa-regular fa-exclamation-triangle"></i>
								{:else}
									<i class="fa-regular fa-cart-plus"></i>
								{/if}
								{getButtonText()}
							</button>
						</div>
					</div>
				</div>
			</div>
			<!-- Reviews Section -->
			<div class="mt-[80px] w-full">
				<div class="flex w-full items-center justify-center">
					<h2 class="font-[League Spartan] mb-[50px] flex items-center justify-center text-center text-[48px] font-bold text-black max-lg:mb-[30px] max-lg:text-[32px]">
						Customer Reviews
					</h2>
				</div>
				<div class="grid grid-cols-1 gap-[20px] md:grid-cols-2">
					{#each mockReviews as review}
						<ReviewCard rating={review.rating} userName={review.userName} userVerified={review.userVerified} reviewText={review.reviewText} reviewDate={review.reviewDate} />
					{/each}
				</div>
			</div>

			<!-- Related Products -->
			{#if relatedProducts.length > 0}
				<div class="mb-[80px] w-full">
					<div class="flex w-full items-center justify-center">
						<h2 class="font-[League Spartan] mb-[50px] flex items-center justify-center text-center text-[48px] font-bold text-black max-lg:mb-[30px] max-lg:text-[32px]">
							You might also like
						</h2>
					</div>
					<div class="grid grid-cols-1 gap-[20px] sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
						{#each relatedProducts as relatedProduct}
							<ProductCard product={relatedProduct} />
						{/each}
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>
{#if showSuccessMessage}
	<div class="fixed right-10 top-20 p-4 rounded-lg shadow-2xl border-l-4 border-green-700 bg-white z-50 animate-slide-in">
		<div class="flex items-center gap-3">
			<i class="fa-regular fa-check-circle text-green-600 text-xl"></i>
			<div>
				<p class="text-green-700 font-[Satoshi] font-medium">Product added to cart successfully!</p>
				<p class="text-green-600 text-sm">Quantity: {quantity}</p>
			</div>
		</div>
	</div>
{/if}

{#if operationStatus === 'error'}
	<div class="fixed right-10 top-20 p-4 rounded-lg shadow-2xl border-l-4 border-red-700 bg-white z-50 animate-slide-in">
		<div class="flex items-center gap-3">
			<i class="fa-regular fa-exclamation-triangle text-red-600 text-xl"></i>
			<div>
				<p class="text-red-700 font-[Satoshi] font-medium">Failed to add to cart</p>
				<p class="text-red-600 text-sm">Please try again</p>
			</div>
		</div>
	</div>
{/if}
<NewsLetter />
<Footer />
