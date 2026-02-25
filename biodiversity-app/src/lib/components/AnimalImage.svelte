<script lang="ts">
    let { imgSrc, imgAlt, attribution } = $props();
</script>

<div class="w-[45vw] flex-shrink-0">
    <img src={imgSrc} alt={imgAlt} class="w-[45vw] h-[65vh] rounded-[25px] object-cover">
    <p>{attribution}</p>
</div>