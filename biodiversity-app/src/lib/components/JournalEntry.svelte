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

<div bind:this={entryDiv} class="journal-div">
    <img src={animalImage} alt={`Photo of ${animalName}`} class="w-[100%] h-[70%] object-cover rounded-t-[20px]">
    <div class="bg-[#FFFAED] rounded-b-[20px]">
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

    @keyframes journal-div-1{
        from{width:100%;height:100%}
        to{width:103%;height:103%}
    }

    @keyframes journal-div-2{
        to{width:100%;height:100%}
        from{width:103%;height:103%}
    }

    .journal-div{
        width:100%;
        height:100%;
        animation: journal-div-2 0.5s ease-out;
    }

    .journal-div:hover{
        width:103%;
        height:103%;
        animation: journal-div-1 0.5s ease-out;
    }
</style>