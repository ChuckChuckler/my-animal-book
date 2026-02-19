<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import axios from "axios";
    import JournalEntryElement from "$lib/components/JournalEntry.svelte";

    let { bookOwner, width, clickable, ownerIsUser } = $props();

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
        journalEntries = journal;
    });
</script>

<h1>{bookOwner}'s Animal Book</h1>
<div class={`w-[${width}%] grid grid-cols-3 bg-red-200`}>
    {#each journalEntries as entry}
        <JournalEntryElement animalName={entry.commonName} animalImage={entry.animalImage} dateOfEntry={entry.dateOf} clickable={clickable}></JournalEntryElement>
    {/each}
</div>