<script lang="ts">
    import { goto } from "$app/navigation";
    import AnimalBook from "$lib/components/AnimalBook.svelte";
    import { onMount } from "svelte";

    let username:string=$state("");

    onMount(()=>{
        username=document.cookie.split("=")[1];
    })

    function rdrctHome(){
        goto("home");
    }

    function addEntry(){
        goto("addEntry");
    }
</script>

<div class="bg-[#E1FFC4] h-[100vh] overflow-hidden border-box p-[20px]">
    <button onclick={rdrctHome} class="koho text-[20px] bg-[#FFDBE6] hover:bg-[#FFC8D7] w-[160px] h-[50px] rounded-[18px] hover:bg-[#FFC8D7]">Return home</button>
    <br>
    <div class="flex justify-between w-[40vw] m-auto">
        <h1 class="koulen text-[35px]">{username}'s Animal Book</h1>
        <button onclick={addEntry} class="w-[200px] rounded-[15px] bg-[#FFDBE6] hover:bg-[#FFC8D7]">Add Entry</button>
    </div>
    <br>
    <AnimalBook bookOwner="" ownerIsUser={true} clickable={true}></AnimalBook>
    <br>
</div>

<style>
    .koulen{
        font-family: "koulen", sans-serif;
    }
    
    .koho{
        font-family: "koho", sans-serif;
    }
</style>