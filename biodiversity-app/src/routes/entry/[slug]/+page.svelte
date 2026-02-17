<script lang="ts">
    import axios from "axios";
    import type { PageProps } from "./$types";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";

    let entryDisplay:any;
    let entryEdit:any;

    let { data }:PageProps = $props();

    let commonName = $state("");
    let scientificName = $state("");
    let animalImage = $state("");
    let dateFound = $state("");
    let entryInfo = $state("");
    let foundWhere = $state("");


    let errMsg = $state("");

    onMount(async ()=>{
        commonName = data.animalName;
        let username = document.cookie.split("=")[1];
        const response = (await axios.post("/api/getEntryInfo",{
            username: username,
            animalName: data.animalName
        })).data.msg;
        scientificName=response.scientificName;
        animalImage=response.animalImage;
        dateFound=response.dateOf;
        entryInfo=response.notes;
        foundWhere=response.found;
    });

    function returnJournal(){
        goto("../animalBook");
    }

    function openEditMenu(){
        entryEdit.style.display = "block";
        entryDisplay.style.display = "none";
    }

    async function saveEdits(){
        let username = document.cookie.split("=")[1];
        //    let { commonName, scientificName, animalImage, found, notes, dateGiven, username } = await request.json();
        const response = (await axios.post("/api/editEntry",{
            previousCommonName: data.animalName,
            commonName: commonName,
            scientificName: scientificName,
            animalImage: animalImage,
            found: foundWhere,
            notes: entryInfo,
            dateGiven: dateFound,
            username:username
        })).data.msg;
        if(response=="success"){
            console.log("yippeee");
            entryEdit.style.display = "none";
            entryDisplay.style.display = "block";
            goto(commonName);
        }
    }
</script>

<button onclick={returnJournal}>Return to journal</button>

<div bind:this={entryDisplay}>
    <h1>{commonName}</h1>
    <h2>{scientificName}</h2>
    <h2>{dateFound}</h2>
    <img src={animalImage} alt={`Image of ${data.animalName}`} class="w-[30vw]">
    <h3>{foundWhere}</h3>
    <p>{entryInfo}</p>
    <br>
    <button onclick={openEditMenu}>Edit</button>
</div>

<div bind:this={entryEdit} class="hidden">
    <input type="text" bind:value={commonName}>
    <br>
    <input type="text" bind:value={scientificName}>
    <h2>{dateFound}</h2>
    <img src={animalImage} alt={`Image of ${commonName}`} class="w-[30vw]">
    <input type="text" bind:value={foundWhere}>
    <br>
    <textarea bind:value={entryInfo}></textarea>
    <button onclick={saveEdits}>Save Edits</button>
    <br>
    <p>{errMsg}</p>
</div>