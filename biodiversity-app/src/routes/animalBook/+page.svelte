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
    <button onclick={rdrctHome} class="koho text-[20px] bg-[#FFDBE6] hover:bg-[#FFC8D7] pink-btn rounded-[18px] hover:bg-[#FFC8D7]">Return home</button>
    <br>
    <div class="flex justify-between w-[40vw] m-auto">
        <h1 class="koulen text-[40px]">{username}'s Animal Book</h1>
        <button onclick={addEntry} class="pink-btn rounded-[15px] bg-[#FFDBE6] hover:bg-[#FFC8D7]">Add Entry</button>
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

    @keyframes pink-btn-1{
        from{width: 160px; height: 50px}
        to{width: 165px; height: 55px}
    }

    @keyframes pink-btn-2{
        to{width: 160px; height: 50px}
        from{width: 165px; height: 55px}
    }

    .pink-btn{
        width: 160px;
        height: 50px;
        animation: pink-btn-2 0.5s ease-out;
    }

    .pink-btn:hover{
        width: 165px;
        height: 55px;
        animation: pink-btn-1 0.5s ease-out;
    }
</style>