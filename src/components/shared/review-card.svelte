<script lang="ts">
	let { 
		rating = 5,
		userName = '',
		userVerified = true,
		reviewText = '',
		reviewDate = '',
		showFullStars = true
	} = $props();

	// Generate star display based on rating
	const generateStars = (rating: number) => {
		const fullStars = Math.floor(rating);
		const hasHalfStar = rating % 1 !== 0;
		const emptyStars = 5 - Math.ceil(rating);
		
		return {
			full: fullStars,
			half: hasHalfStar,
			empty: emptyStars
		};
	};

	const stars = $derived(generateStars(rating));
</script>

<div class="box-border min-h-[240px] w-[100%] gap-y-[24px] rounded-[20px] border border-black/10 p-[28px] px-[32px] max-md:min-h-[auto] max-md:p-[25px]">
	<div class="stars mb-[15px] flex items-center gap-[8px]">
		{#each Array(stars.full) as _}
			<i class="fa-solid fa-star text-[14px] text-[#FFC633]"></i>
		{/each}
		{#if stars.half}
			<i class="fa-solid fa-star-half-stroke text-[14px] text-[#FFC633]"></i>
		{/if}
		{#each Array(stars.empty) as _}
			<i class="fa-regular fa-star text-[14px] text-[#FFC633]"></i>
		{/each}
	</div>
	<div class="stars mb-[15px] flex items-center gap-[8px]">
		<h6 class="order-0 flex-none grow-0 font-[Satoshi] text-[20px] leading-[22px] font-bold text-black">
			{userName}
		</h6>
		{#if userVerified}
			<i class="fa-solid fa-circle-check text-[#01AB31]"></i>
		{/if}
	</div>
	<p class="mb-[15px] font-[Satoshi] text-[16px] leading-[22px] font-normal text-black/60">
		"{reviewText}"
	</p>
	<p class="h-[22px] font-[Satoshi] text-[16px] leading-[22px] font-medium text-black/60">
		Posted on {reviewDate}
	</p>
</div> 