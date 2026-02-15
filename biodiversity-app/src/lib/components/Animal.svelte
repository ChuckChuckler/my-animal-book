<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";

    let { commonName, scientificName, threatLevel, id, imgSrc } = $props();

    onMount(()=>{
        document.getElementById(id)?.addEventListener("click", function(){
            goto(`animal/${id}`);
        })
    })
</script>

<div id={id}>
    <img src={imgSrc} alt={scientificName}>
    <h1>{commonName}</h1>
    <h3>{scientificName}</h3>
    <h2>{threatLevel}</h2>
</div>