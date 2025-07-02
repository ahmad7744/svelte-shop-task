<script lang="ts">
	import { cartService } from '$lib/services/cart';
	import { onMount } from 'svelte';

	let cartState = $state(cartService.getState());
	let unsubscribe: (() => void) | null = null;

	onMount(() => {
		unsubscribe = cartService.subscribe(() => {
			cartState = cartService.getState();
		});

		return () => {
			if (unsubscribe) {
				unsubscribe();
			}
		};
	});

	// Get queue status text
	const getQueueStatusText = () => {
		if (cartState.isProcessing) {
			return 'Processing queue...';
		}
		if (cartState.queue.length > 0) {
			const pendingCount = cartState.queue.filter(op => op.status === 'pending').length;
			const processingCount = cartState.queue.filter(op => op.status === 'processing').length;
			
			if (processingCount > 0) {
				return `Processing ${processingCount} operation${processingCount > 1 ? 's' : ''}...`;
			}
			if (pendingCount > 0) {
				return `${pendingCount} operation${pendingCount > 1 ? 's' : ''} queued`;
			}
		}
		return 'Queue idle';
	};

	// Get status color
	const getStatusColor = () => {
		if (cartState.isProcessing) {
			return 'text-blue-600';
		}
		if (cartState.queue.length > 0) {
			return 'text-orange-600';
		}
		return 'text-gray-500';
	};

	// Get status icon
	const getStatusIcon = () => {
		if (cartState.isProcessing) {
			return 'fa-spinner fa-spin';
		}
		if (cartState.queue.length > 0) {
			return 'fa-clock';
		}
		return 'fa-check';
	};
</script>

{#if cartState.queue.length > 0 || cartState.isProcessing}
	<div class="fixed bottom-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs">
		<div class="flex items-center gap-2">
			<i class="fa-solid {getStatusIcon()} {getStatusColor()}"></i>
			<div class="flex-1">
				<p class="font-[Satoshi] text-[12px] font-medium {getStatusColor()}">
					{getQueueStatusText()}
				</p>
				{#if cartState.queue.length > 0}
					<p class="font-[Satoshi] text-[10px] text-gray-500">
						Queue length: {cartState.queue.length}
					</p>
				{/if}
			</div>
		</div>
		
		<!-- Queue Progress Bar -->
		{#if cartState.isProcessing}
			<div class="mt-2 w-full bg-gray-200 rounded-full h-1">
				<div class="bg-blue-600 h-1 rounded-full animate-pulse" style="width: 60%"></div>
			</div>
		{/if}
		
		<!-- Queue Details (for debugging/demo) -->
		{#if cartState.queue.length > 0}
			<div class="mt-2 pt-2 border-t border-gray-100">
				<div class="space-y-1">
					{#each cartState.queue.slice(0, 3) as operation}
						<div class="flex items-center justify-between text-[10px]">
							<span class="text-gray-600 capitalize">{operation.type}</span>
							<span class="font-medium {
								operation.status === 'pending' ? 'text-yellow-600' :
								operation.status === 'processing' ? 'text-blue-600' :
								operation.status === 'completed' ? 'text-green-600' :
								'text-red-600'
							}">
								{operation.status}
							</span>
						</div>
					{/each}
					{#if cartState.queue.length > 3}
						<div class="text-[10px] text-gray-500 text-center">
							+{cartState.queue.length - 3} more
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
{/if} 