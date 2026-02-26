<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import axios from "axios";
    import JournalEntryElement from "$lib/components/JournalEntry.svelte";

    let { bookOwner, clickable, ownerIsUser } = $props();

    type JournalEntry = {
        commonName:string,
        scientificName:string,
        animalImage:string,
        found:string,
        notes:string,
        dateOf:string
    };

    let journalEntries:JournalEntry[] = $state([]);


    onMount(async ()=>{
        if(ownerIsUser){
            bookOwner=document.cookie.split("=")[1];
        }
        const journal = (await axios.post("/api/getJournal", {
            username:bookOwner
        })).data.msg.journal;
        journalEntries = journal.reverse();
    });
</script>

<div class="grid grid-cols-3 gap-5 bg-[#C1ED96] rounded-[20px] m-auto grid-holder overflow-auto scrollbar border-box p-[15px]">
    {#each journalEntries as entry}
        <JournalEntryElement animalName={entry.commonName} animalImage={entry.animalImage} dateOfEntry={entry.dateOf} clickable={clickable}></JournalEntryElement>
    {/each}
</div>

<style>
    @keyframes grid-holder-1{
        from{width:90%;height:72vh}
        to{width:93%;height:73vh}
    }

    @keyframes grid-holder-2{
        to{width:90%;height:72vh}
        from{width:93%;height:73vh}
    }

    .grid-holder{
        width:90%;
        height:72vh;
        animation: grid-holder-2 0.5s ease-out;
    }

    .grid-holder:hover{
        width:93%;
        height:73vh;
        animation: grid-holder-1 0.5s ease-out;
    }

    .scrollbar{
        scrollbar-width: thin;
        scrollbar-color: #FFDBE6 white;
    }
</style>