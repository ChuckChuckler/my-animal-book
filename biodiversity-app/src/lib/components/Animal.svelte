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

<div id={id} class="bg-[#FAF1DA] hover:bg-[#F4E8C9] flex justify-between rounded-[15px]">
    <img src={imgSrc} alt={scientificName} class="rounded-[15px]">
    <div class="w-[75%] m-auto">
        <h1 class="text-[20px] koho">{commonName}</h1>
        <h2 class="koho">{threatLevel}</h2>
    </div>
</div>

<style>
    .koho{
        font-family: "KoHo", sans-serif;
    }
</style>