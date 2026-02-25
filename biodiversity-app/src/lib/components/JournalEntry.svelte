<script lang="ts">
    import { goto } from "$app/navigation";
    let { animalName, animalImage, dateOfEntry, clickable } = $props();
    import { onMount } from "svelte";

    let entryDiv:any;

    onMount(()=>{
        if(clickable){
            entryDiv.addEventListener("click", ()=>{
                goto(`entry/${animalName}`)
            });
        }
    });
</script>

<div bind:this={entryDiv}>
    <img src={animalImage} alt={`Photo of ${animalName}`} class="w-[100%] h-[42vh] object-cover rounded-t-[20px]">
    <div class="bg-[#FFFAED] h-[10vh] rounded-b-[20px]">
        <h1 class="text-center kaisei-tokumin text-[24px]">{animalName}</h1>
        <h3 class="text-center koho text-[15px]">{dateOfEntry}</h3>
    </div>
</div>

<style>
    .kaisei-tokumin{
        font-family: "kaisei-tokumin", serif;
    }

    .koho{
        font-family: "koho", sans-serif;
    }
</style>