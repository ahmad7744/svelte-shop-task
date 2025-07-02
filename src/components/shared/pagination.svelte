<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let { 
		currentPage, 
		totalItems, 
		itemsPerPage, 
		onPageChange,
		baseUrl = '/category'
	} = $props();

	const totalPages = $derived(Math.ceil(totalItems / itemsPerPage));
	const startItem = $derived((currentPage - 1) * itemsPerPage + 1);
	const endItem = $derived(Math.min(currentPage * itemsPerPage, totalItems));

	// Generate page numbers to show
	const pageNumbers = $derived((() => {
		const pages: (number | string)[] = [];
		const maxVisible = 5;
		
		if (totalPages <= maxVisible) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Always show first page
			pages.push(1);
			
			if (currentPage > 3) {
				pages.push('...');
			}
			
			// Show pages around current page
			const start = Math.max(2, currentPage - 1);
			const end = Math.min(totalPages - 1, currentPage + 1);
			
			for (let i = start; i <= end; i++) {
				if (!pages.includes(i)) {
					pages.push(i);
				}
			}
			
			if (currentPage < totalPages - 2) {
				pages.push('...');
			}
			
			// Always show last page
			if (!pages.includes(totalPages)) {
				pages.push(totalPages);
			}
		}
		
		return pages;
	})());

	const handlePageChange = async (newPage: number) => {
		if (newPage === currentPage || newPage < 1 || newPage > totalPages) return;
		
		// Update URL with new page parameter
		const url = new URL($page.url);
		url.searchParams.set('page', newPage.toString());
		await goto(url.toString(), { replaceState: false });
		
		// Call the callback
		onPageChange(newPage);
	};

	const goToPrevious = () => {
		if (currentPage > 1) {
			handlePageChange(currentPage - 1);
		}
	};

	const goToNext = () => {
		if (currentPage < totalPages) {
			handlePageChange(currentPage + 1);
		}
	};
</script>

{#if totalPages > 1}
	<div class="flex items-center justify-between border-t border-black/10 pt-[30px] max-md:justify-center">
		<div class="max-md:hidden">
			<button
				class="flex h-[36px] w-[110px] items-center justify-center gap-[8px] rounded-[8px] border border-black/10 bg-white px-[14px] py-[8px] font-[Satoshi] text-[14px] leading-[20px] font-medium text-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
				disabled={currentPage <= 1}
				onclick={goToPrevious}
			>
				<i class="fa-regular fa-arrow-left"></i>
				Previous
			</button>
		</div>
		
		<div class="flex items-center space-x-3 text-sm font-medium text-gray-500 max-md:space-x-1">
			{#each pageNumbers as pageNum}
				{#if pageNum === '...'}
					<span class="px-2">...</span>
				{:else}
					<button
						class="flex h-8 w-8 items-center justify-center rounded-lg transition-colors {pageNum === currentPage ? 'bg-black text-white' : 'hover:bg-gray-100'}"
						onclick={() => handlePageChange(pageNum as number)}
					>
						{pageNum}
					</button>
				{/if}
			{/each}
		</div>

		<div class="max-md:hidden">
			<button
				class="flex h-[36px] w-[110px] items-center justify-center gap-[8px] rounded-[8px] border border-black/10 bg-white px-[14px] py-[8px] font-[Satoshi] text-[14px] leading-[20px] font-medium text-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
				disabled={currentPage >= totalPages}
				onclick={goToNext}
			>
				Next
				<i class="fa-regular fa-arrow-right"></i>
			</button>
		</div>
	</div>
	
	<!-- Show items info -->
	<div class="mt-4 text-center text-sm text-gray-600 md:hidden">
		Showing {startItem}–{endItem} of {totalItems} products
	</div>
{/if} 