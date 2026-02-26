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

<div id={id} class="animal-div bg-[#FAF1DA] hover:bg-[#F4E8C9] flex justify-between rounded-[15px]">
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

    @keyframes animal-div-1{
        from{width: 100%; height:100%}
        to{width:102%;height:102%}
    }

    @keyframes animal-div-2{
        to{width: 100%; height:100%}
        from{width:102%;height:102%}
    }

    .animal-div{
        width:100%;
        height:100%;
        animation: animal-div-2 0.5s ease-out;
    }

    .animal-div:hover{
        width:102%;
        height:102%;
        animation: animal-div-1 0.5s ease-out;
    }
</style>