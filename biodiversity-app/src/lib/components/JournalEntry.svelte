<script lang="ts">
    import { goto } from "$app/navigation";
    let { animalName, animalImage, dateOfEntry } = $props();
    import { onMount } from "svelte";

    let entryDiv:any;

    onMount(()=>{
        entryDiv.addEventListener("click", ()=>{
            goto(`entry/${animalName}`)
        })
    });
    function hi(){
        console.log(animalName);
    }
</script>
<div class="w-[20vw] bg-red-100" bind:this={entryDiv}>
    <h1>{animalName}</h1>
    <img src={animalImage} alt={`Photo of ${animalName}`} class="w-[15vw]">
    <h3>{dateOfEntry}</h3>
</div>