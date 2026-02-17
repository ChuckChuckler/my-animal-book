<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import axios from "axios";

    import JournalEntryElement from "$lib/components/JournalEntry.svelte";

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
        let username = document.cookie.split("=")[1];
        const journal = (await axios.post("/api/getJournal", {
            username:username
        })).data.msg.journal;
        journalEntries = journal;
    })

    function addEntry(){
        goto("addEntry");
    }

    function rdrctHome(){
        goto("home");
    }
</script>

<button onclick={rdrctHome}>Return home</button>
<br>

<h1>Animal Book</h1>
<div class="w-[80%] grid grid-cols-3 bg-red-200">
    {#each journalEntries as entry}
        <JournalEntryElement animalName={entry.commonName} animalImage={entry.animalImage} dateOfEntry={entry.dateOf}></JournalEntryElement>
    {/each}
</div>
<br>
<button onclick={addEntry}>Add Entry</button>