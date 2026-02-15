<script lang="ts">
    let { imgSrc, imgAlt, attribution } = $props();
</script>

<img src={imgSrc} alt={imgAlt}>
<p>{attribution}</p>