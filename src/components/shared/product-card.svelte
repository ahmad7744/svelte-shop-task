<script lang="ts">
    let {product} = $props();
    let {image, name, price, rating,id} = product;
</script>
<a href={`/product-detail/${id}`}>
<div class="p-card">
	<div class="mb-[15px] h-[298px] w-[100%] bg-white overflow-hidden rounded-[20px] flex justify-center items-center p-4">
		<img src={image} class="h-full object-fit" alt="" />
	</div>
	<h6
	    class="mb-[8px] flex items-center font-[Satoshi] text-[18px] leading-[27px] font-bold text-black"
	>
	    {name}
	</h6>
	<div class="stars mb-[8px] flex items-center gap-[5px]">
		<i class="fa-solid fa-star text-[14px] text-[#FFC633]"></i>
		<i class="fa-solid fa-star text-[14px] text-[#FFC633]"></i>
		<i class="fa-solid fa-star text-[14px] text-[#FFC633]"></i>
		<i class="fa-solid fa-star text-[14px] text-[#FFC633]"></i>
		<i class="fa-solid fa-star text-[14px] text-[#FFC633]"></i>
		<span class=" font-[Satoshi] text-[14px] leading-[19px] font-normal text-black">
			{rating}
		</span>
	</div>
	<h6
		class="flex items-center font-[Satoshi] text-[24px] leading-[32px] font-bold text-black"
	>
	    {price}
	</h6>
</div>
</a>