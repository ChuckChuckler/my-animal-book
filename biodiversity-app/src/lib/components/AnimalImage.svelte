<script lang="ts">
    let { imgSrc, imgAlt, attribution, display, id } = $props();
</script>

<div class={display} id={id}>
    <img src={imgSrc} alt={imgAlt} class="w-[45vw] h-[65vh] rounded-[25px] object-cover">
    <p class="w-[45vw]">{attribution}</p>
</div>