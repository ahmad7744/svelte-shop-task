<script lang="ts">
	import { onMount } from 'svelte';
	import Discount from '../components/shared/discount.svelte';
 	import Header from '../components/global/header.svelte';
  	import Footer from '../components/global/footer.svelte';
  	import NewsLetter from '../components/shared/news-letter.svelte';
  	import ProductCatelog from '../components/shared/product-catelog.svelte';
	import LoadingSkeleton from '../components/shared/loading-skeleton.svelte';
	import { useHomeProducts } from '$lib/hooks/useProducts';

	// Use the custom hook to load products
	const { uiProductsStore } = useHomeProducts();

	// Reactive statement to get products from store
	$: ({ newArrivals, topSelling, loading, error } = $uiProductsStore);

	// Counter animation variables
	let brandsCount = 0;
	let productsCount = 0;
	let customersCount = 0;
	let animationStarted = false;

	// Animation function
	function animateCounter(target: number, current: number, setter: (val: number) => void, duration: number = 2000, suffix: string = '') {
		const startTime = Date.now();
		const startValue = current;
		
		function updateCounter() {
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / duration, 1);
			
			// Easing function for smooth animation
			const easeOutQuart = 1 - Math.pow(1 - progress, 4);
			const currentValue = Math.floor(startValue + (target - startValue) * easeOutQuart);
			
			setter(currentValue);
			
			if (progress < 1) {
				requestAnimationFrame(updateCounter);
			}
		}
		
		requestAnimationFrame(updateCounter);
	}

	// Start animations when component mounts
	onMount(() => {
		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting && !animationStarted) {
					animationStarted = true;
					
					// Start counter animations with different durations
					setTimeout(() => animateCounter(200, brandsCount, (val: number) => brandsCount = val, 1500), 0);
					setTimeout(() => animateCounter(2000, productsCount, (val: number) => productsCount = val, 2000), 200);
					setTimeout(() => animateCounter(10000, customersCount, (val: number) => customersCount = val, 2500), 400);
				}
			});
		}, { threshold: 0.3 });

		// Observe the stats container
		const statsElement = document.querySelector('.stats-container');
		if (statsElement) {
			observer.observe(statsElement);
		}

		return () => observer.disconnect();
	});

	// Format numbers with commas
	function formatNumber(num: number): string {
		return num.toLocaleString();
	}
</script>
<Discount />

<Header/>
<div
	class="hero-section flex min-h-screen w-full items-center bg-[#F2F0F1] bg-[url('/images/hero.png')] bg-cover bg-center bg-no-repeat py-[60px] max-lg:py-[40px]"
>
	<div class="container m-auto w-full max-w-[1240px] pr-[15px] pl-[15px]">
		<div class="w-full max-w-[600px]">
			<h1
				class="font-[League Spartan] space-[-20px] mb-[30px] flex items-center text-[70px] font-[800] text-black max-lg:text-[50px] max-md:text-[40px]"
			>
				FIND CLOTHES THAT MATCHES YOUR STYLE
			</h1>
			<p class=" mb-[30px] font-[Satoshi] text-[16px] leading-[22px] font-normal text-black/60">
				Browse through our diverse range of meticulously crafted garments, designed to bring out
				your individuality and cater to your sense of style.
			</p>
			<div class="flex gap-[15px]">
				<a
					href="/category?page=1"
					class="flex h-[52px] w-[210px] items-center justify-center gap-[12px] rounded-[62px] bg-black px-[54px] py-[16px]"
				>
					<span
					class="h-[22px] w-[75px] font-[Satoshi] text-[16px] leading-[22px] font-medium text-white"
					>
					Products
					</span>
				</a>
			<a
				href="/checkout"
					class="flex h-[52px] w-[210px] items-center justify-center gap-[12px] rounded-[62px] bg-white border-2 px-[54px] py-[16px]"
				>
					<span
						class="h-[22px] w-[75px] font-[Satoshi] text-[16px] leading-[22px] font-medium text-black"
					>
						Checkout
					</span>
			</a>
		</div>
			<div class="flex gap-[15px] py-[40px] max-lg:flex-col max-lg:pb-[0] stats-container">
				<div class="">
					<h3
						class="order-0 -my-[2px] flex flex-none grow-0 items-center font-[Satoshi] text-[40px] leading-[54px] font-bold text-black"
					>
						{formatNumber(brandsCount)}+
					</h3>
					<p class=" font-[Satoshi] text-[14px] leading-[22px] font-normal text-black/60">
						International Brands
					</p>
				</div>
				<div class="devider mx-[30px] h-[75px] w-[1px] bg-[#00000044] max-lg:hidden"></div>
				<div class="">
					<h3
						class="order-0 -my-[2px] flex flex-none grow-0 items-center font-[Satoshi] text-[40px] leading-[54px] font-bold text-black"
					>
						{formatNumber(productsCount)}+
					</h3>
					<p class=" font-[Satoshi] text-[14px] leading-[22px] font-normal text-black/60">
						High-Quality Products
					</p>
				</div>
				<div class="devider mx-[30px] h-[75px] w-[1px] bg-[#00000044] max-lg:hidden"></div>
				<div class="">
					<h3
						class="order-0 -my-[2px] flex flex-none grow-0 items-center font-[Satoshi] text-[40px] leading-[54px] font-bold text-black"
					>
						{formatNumber(customersCount)}+
					</h3>
					<p class=" font-[Satoshi] text-[14px] leading-[22px] font-normal text-black/60">
						Happy Customers
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
<div class="partners w-full bg-black">
	<!-- svelte-ignore a11y_distracting_elements -->
	<marquee
		speed={100}
		direction="right"
		class="container mx-auto w-full pr-[15px] pl-[15px]"
	>
		<div
			class="flex min-h-[120px] w-full items-center justify-between py-[20px] max-md:flex-wrap max-md:justify-evenly"
		>
			<img src="/images/l1.png" class="h-[33px] max-lg:h-[25px]" alt="" />
			<img src="/images/l2.png" class="h-[33px] max-lg:h-[25px]" alt="" />
			<img src="/images/l3.png" class="h-[33px] max-lg:h-[25px]" alt="" />
			<img src="/images/l4.png" class="h-[33px] max-lg:h-[25px]" alt="" />
			<img src="/images/l5.png" class="h-[33px] max-lg:h-[25px]" alt="" />
		</div>
	</marquee>
</div>

<!-- New Arrivals Section -->
{#if loading}
	<LoadingSkeleton title="NEW ARRIVALS" count={4} />
{:else if error}
	<div class="new-arrival py-[70px] max-lg:py-[40px]">
		<div class="container m-auto w-full max-w-[1240px] pr-[15px] pl-[15px]">
			<div class="flex w-full items-center justify-center">
				<h2 class="font-[League Spartan] mb-[50px] flex items-center justify-center text-center text-[48px] font-bold text-black max-lg:mb-[30px] max-lg:text-[32px]">
					NEW ARRIVALS
				</h2>
			</div>
			<div class="text-center py-8">
				<p class="text-red-500 mb-4">Error loading products: {error}</p>
				<button 
					class="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
					on:click={() => location.reload()}
				>
					Retry
				</button>
			</div>
		</div>
	</div>
{:else}
	<ProductCatelog title="NEW ARRIVALS" products={newArrivals} />
{/if}

<div class="container m-auto w-full max-w-[1240px] pr-[15px] pl-[15px]">
	<div class="h-[1px] w-full bg-[#00000044]"></div>
</div>

<!-- Top Selling Section -->
{#if loading}
	<LoadingSkeleton title="TOP SELLING" count={4} />
{:else if error}
	<div class="new-arrival py-[70px] max-lg:py-[40px]">
		<div class="container m-auto w-full max-w-[1240px] pr-[15px] pl-[15px]">
			<div class="flex w-full items-center justify-center">
				<h2 class="font-[League Spartan] mb-[50px] flex items-center justify-center text-center text-[48px] font-bold text-black max-lg:mb-[30px] max-lg:text-[32px]">
					TOP SELLING
				</h2>
			</div>
			<div class="text-center py-8">
				<p class="text-red-500 mb-4">Error loading products: {error}</p>
				<button 
					class="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
					on:click={() => location.reload()}
				>
					Retry
				</button>
			</div>
		</div>
	</div>
{:else}
	<ProductCatelog title="TOP SELLING" products={topSelling} />
{/if}

<div class="container m-auto w-full max-w-[1240px] pr-[15px] pl-[15px]">
	<div
		class="style mx-auto w-full rounded-[40px] bg-[#F0F0F0] px-[65px] py-[70px] max-lg:px-[45px] max-lg:py-[50px] max-md:p-[30px]"
	>
		<div class="flex w-full items-center justify-center">
			<h2
				class=" font-[League Spartan] mb-[50px] flex items-center justify-center text-center text-[48px] font-bold text-black max-lg:mb-[30px] max-lg:text-[32px]"
			>
				BROWSE BY DRESS STYLE
			</h2>
		</div>
		<div class="grid grid-cols-12 gap-6">
			<div class="col-span-12 lg:col-span-5">
				<div
					class="h-[290px] w-full rounded-[20px] bg-gray-200 bg-[url('/images/b1.png')] bg-cover bg-center bg-no-repeat px-[35px] py-[25px] max-lg:px-[25px] max-lg:py-[15px]"
				>
					<h5
						class="flex items-center font-[Satoshi] text-[36px] font-bold text-black max-lg:text-[26px]"
					>
						Casual
					</h5>
				</div>
			</div>
			<div class="col-span-12 lg:col-span-7">
				<div
					class="h-[290px] w-full rounded-[20px] bg-gray-200 bg-[url('/images/b2.png')] bg-cover bg-center bg-no-repeat px-[35px] py-[25px] max-lg:px-[25px] max-lg:py-[15px]"
				>
					<h5
						class="flex items-center font-[Satoshi] text-[36px] font-bold text-black max-lg:text-[26px]"
					>
						Formal
					</h5>
				</div>
			</div>
			<div class="col-span-12 lg:col-span-7">
				<div
					class="h-[290px] w-full rounded-[20px] bg-gray-200 bg-[url('/images/b3.png')] bg-cover bg-center bg-no-repeat px-[35px] py-[25px] max-lg:px-[25px] max-lg:py-[15px]"
				>
					<h5
						class="flex items-center font-[Satoshi] text-[36px] font-bold text-black max-lg:text-[26px]"
					>
						Party
					</h5>
				</div>
			</div>
			<div class="col-span-12 lg:col-span-5">
				<div
					class="h-[290px] w-full rounded-[20px] bg-gray-200 bg-[url('/images/b4.png')] bg-cover bg-center bg-no-repeat px-[35px] py-[25px] max-lg:px-[25px] max-lg:py-[15px]"
				>
					<h5
						class="flex items-center font-[Satoshi] text-[36px] font-bold text-black max-lg:text-[26px]"
					>
						Gym
					</h5>
				</div>
			</div>
		</div>
	</div>
</div>
<div class="py-[80px] max-lg:py-[50px]">
	<div class="container m-auto w-full max-w-[1240px] pr-[15px] pl-[15px]">
		<h2
			class="font-[League Spartan] mb-[50px] text-[48px] font-bold text-black max-lg:mb-[30px] max-lg:text-[32px]"
		>
			OUR HAPPY CUSTOMERS
		</h2>
		<div class="grid grid-cols-12 gap-6">
			<div class="col-span-12 md:col-span-12 lg:col-span-4">
				<div
					class="box-border h-[240px] w-[100%] gap-x-[342px] gap-y-[24px] rounded-[20px] border border-black/10 p-[28px] px-[32px] max-lg:p-[20px] max-lg:px-[20px] max-md:h-auto"
				>
					<div class="stars mb-[15px] flex items-center gap-[8px]">
						<i class="fa-solid fa-star text-[14px] text-[#FFC633]"></i>
						<i class="fa-solid fa-star text-[14px] text-[#FFC633]"></i>
						<i class="fa-solid fa-star text-[14px] text-[#FFC633]"></i>
						<i class="fa-solid fa-star text-[14px] text-[#FFC633]"></i>
						<i class="fa-solid fa-star text-[14px] text-[#FFC633]"></i>
					</div>
					<div class="stars mb-[15px] flex items-center gap-[8px]">
						<h6
							class="order-0 flex-none grow-0 font-[Satoshi] text-[20px] leading-[22px] font-bold text-black"
						>
							Sarah M.
						</h6>
						<i class="fa-solid fa-circle-check text-[#01AB31]"></i>
					</div>
					<p class="font-[Satoshi] text-[16px] leading-[22px] font-normal text-black/60">
						"I'm blown away by the quality and style of the clothes I received from Shop.co. From
						casual wear to elegant dresses, every piece I've bought has exceeded my expectations.”
					</p>
				</div>
			</div>
			<div class="col-span-12 md:col-span-12 lg:col-span-4">
				<div
					class="box-border h-[240px] w-[100%] gap-x-[342px] gap-y-[24px] rounded-[20px] border border-black/10 p-[28px] px-[32px] max-lg:p-[20px] max-lg:px-[20px] max-md:h-auto"
				>
					<div class="stars mb-[15px] flex items-center gap-[8px]">
						<i class="fa-solid fa-star text-[14px] text-[#FFC633]"></i>
						<i class="fa-solid fa-star text-[14px] text-[#FFC633]"></i>
						<i class="fa-solid fa-star text-[14px] text-[#FFC633]"></i>
						<i class="fa-solid fa-star text-[14px] text-[#FFC633]"></i>
						<i class="fa-solid fa-star text-[14px] text-[#FFC633]"></i>
					</div>
					<div class="stars mb-[15px] flex items-center gap-[8px]">
						<h6
							class="order-0 flex-none grow-0 font-[Satoshi] text-[20px] leading-[22px] font-bold text-black"
						>
							Alex K.
						</h6>
						<i class="fa-solid fa-circle-check text-[#01AB31]"></i>
					</div>
					<p class="font-[Satoshi] text-[16px] leading-[22px] font-normal text-black/60">
						"I'm blown away by the quality and style of the clothes I received from Shop.co. From
						casual wear to elegant dresses, every piece I've bought has exceeded my expectations.”
					</p>
				</div>
			</div>
			<div class="col-span-12 md:col-span-12 lg:col-span-4">
				<div
					class="box-border h-[240px] w-[100%] gap-x-[342px] gap-y-[24px] rounded-[20px] border border-black/10 p-[28px] px-[32px] max-lg:p-[20px] max-lg:px-[20px] max-md:h-auto"
				>
					<div class="stars mb-[15px] flex items-center gap-[8px]">
						<i class="fa-solid fa-star text-[14px] text-[#FFC633]"></i>
						<i class="fa-solid fa-star text-[14px] text-[#FFC633]"></i>
						<i class="fa-solid fa-star text-[14px] text-[#FFC633]"></i>
						<i class="fa-solid fa-star text-[14px] text-[#FFC633]"></i>
						<i class="fa-solid fa-star text-[14px] text-[#FFC633]"></i>
					</div>
					<div class="stars mb-[15px] flex items-center gap-[8px]">
						<h6
							class="order-0 flex-none grow-0 font-[Satoshi] text-[20px] leading-[22px] font-bold text-black"
						>
							James L.
						</h6>
						<i class="fa-solid fa-circle-check text-[#01AB31]"></i>
					</div>
					<p class="font-[Satoshi] text-[16px] leading-[22px] font-normal text-black/60">
						"I'm blown away by the quality and style of the clothes I received from Shop.co. From
						casual wear to elegant dresses, every piece I've bought has exceeded my expectations.”
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
<NewsLetter />
<Footer/>
