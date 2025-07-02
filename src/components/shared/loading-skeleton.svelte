<script lang="ts">
	let { count = 4, title = "Loading..." } = $props();
</script>

<div class="new-arrival py-[70px] max-lg:py-[40px]">
	<div class="container m-auto w-full max-w-[1240px] pr-[15px] pl-[15px]">
		<div class="flex w-full items-center justify-center">
			<h2 class="font-[League Spartan] mb-[50px] flex items-center justify-center text-center text-[48px] font-bold text-black max-lg:mb-[30px] max-lg:text-[32px]">
				{title}
			</h2>
		</div>
		<div class="grid grid-cols-1 gap-[20px] sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
			{#each Array(count) as _}
				<div class="animate-pulse">
					<div class="mb-[15px] h-[298px] w-[100%] bg-gray-300 rounded-[20px]"></div>
					<div class="h-4 bg-gray-300 rounded mb-2"></div>
					<div class="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
					<div class="h-6 bg-gray-300 rounded w-1/3"></div>
				</div>
			{/each}
		</div>
	</div>
</div> 