<script lang="ts">
    import axios from "axios";
    import type { PageProps } from "./$types";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";

    let entryDisplay:any;
    let entryEdit:any;
    let deletionConfirmation:any;

    let { data }:PageProps = $props();

    let commonName = $state("");
    let scientificName = $state("");
    let animalImage = $state("");
    let dateFound = $state("");
    let entryInfo = $state("");
    let foundWhere = $state("");

    let commonNameEdited = $state("");
    let scientificNameEdited = $state("");
    let entryInfoEdited = $state("");
    let foundWhereEdited = $state("");


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

        commonNameEdited=commonName;
        scientificNameEdited=scientificName;
        foundWhereEdited=foundWhere;
        entryInfoEdited=entryInfo;
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
        const response = (await axios.post("/api/editEntry",{
            previousCommonName: data.animalName,
            commonName: commonNameEdited,
            scientificName: scientificNameEdited,
            animalImage: animalImage,
            found: foundWhereEdited,
            notes: entryInfoEdited,
            dateGiven: dateFound,
            username:username
        })).data.msg;
        if(response=="success"){
            entryEdit.style.display = "none";
            entryDisplay.style.display = "block";
            commonName=commonNameEdited;
            scientificName=scientificNameEdited;
            foundWhere=foundWhereEdited;
            entryInfo=entryInfoEdited;
            goto(commonName);
        }
    }

    function cancelEdits(){
        entryEdit.style.display = "none";
        entryDisplay.style.display = "block";
        commonNameEdited=commonName;
        scientificNameEdited=scientificName;
        foundWhereEdited=foundWhere;
        entryInfoEdited=entryInfo;
    }

    function promptDelConfirmation(){
        deletionConfirmation.style.display = "block";
        entryDisplay.style.display = "none";
    }

    function cancelDel(){
        deletionConfirmation.style.display = "none";
        entryDisplay.style.display  = "block";
    }

    async function deleteEntry(){
        let username = document.cookie.split("=")[1];
        const response = (await axios.post("/api/deleteEntry", {
            username: username,
            animalName: commonName
        })).data.msg;
        if(response=="success"){
            goto("../animalBook");
        }else{
            alert(response);
        }
    }
</script>

<div class="bg-[#E1FFC4] border-box p-[15px]">
    <button onclick={returnJournal} class="koho text-[20px] bg-[#FFDBE6] hover:bg-[#FFC8D7] pink-btn rounded-[18px] hover:bg-[#FFC8D7]">Return to journal</button>
    <div bind:this={entryDisplay}>
        <h2 class="text-center text-[40px] kaisei-tokumin">{dateFound}</h2>
        <br>
        <div class="flex justify-around w-[95%] h-[68vh] m-auto">
            <img src={animalImage} alt={`Image of ${data.animalName}`} class="img rounded-[20px] object-cover">
            <div class="w-[48%]">
                <h1 class="kaisei-tokumin text-center text-[38px]">{commonName}</h1>
                <hr class="border-[0.5px] border-black w-[60%] m-auto">
                <h2 class="koho text-center text-[32px]">{scientificName}</h2>
                <br>
                <h3 class="koho text-[22px]">Found: {foundWhere}</h3>
                <p class="koho text-[22px]">Notes:<br>{entryInfo}</p>
            </div>
        </div>
        <br>
        <div class="flex justify-around w-[35%] m-auto">
            <button onclick={openEditMenu} class="koho text-[20px] bg-[#FFDBE6] hover:bg-[#FFC8D7] pink-btn rounded-[18px] hover:bg-[#FFC8D7]">Edit</button>
            <button onclick={promptDelConfirmation} class="koho text-[20px] bg-[#FFDBE6] hover:bg-[#FFC8D7] pink-btn rounded-[18px] hover:bg-[#FFC8D7]">Delete Entry</button>
        </div>
    </div>

    <div bind:this={entryEdit} class="hidden h-[100vh]">
        <h2 class="text-center text-[40px] kaisei-tokumin">Edit Entry</h2>
        <br>
        <div class="flex justify-around w-[95%] h-[68vh] m-auto">
            <img src={animalImage} alt={`Image of ${data.animalName}`} class="img rounded-[20px] object-cover">
            <div class="w-[48%]">
                <label class="koho text-[20px]" for="animalCommonName">Entry Title/Animal Name (if applicable)</label>
                <input id="animalCommonName" autocomplete="off" class="pl-[15px] block m-auto text-[22px] bg-[#FFF8E6] rounded-[20px] edit-inputs" type="text" bind:value="{commonNameEdited}">
                <br>
                <label class="koho text-[20px]" for="animalScientificName">Subtitle/Scientific Name (if applicable)</label>
                <input autocomplete="off" class="pl-[15px] block m-auto text-[22px] bg-[#FFF8E6] rounded-[20px] edit-inputs" bind:value={scientificNameEdited}>
                <br>
                <label class="koho text-[20px]" for="animalFoundWhere">Found:</label>
                <input autocomplete="off" type="text" class="text-[22px] pl-[15px] block m-auto bg-[#FFF8E6] rounded-[20px] edit-inputs" id="animalFoundWhere" bind:value={foundWhereEdited}>
                <br>
                <label class="koho text-[20px]" for="animalEntryDesc">Notes:</label>
                <textarea id="animalEntryDesc" bind:value={entryInfoEdited} class="text-[22px] pl-[15px] block m-auto bg-[#FFF8E6] rounded-[20px] edit-inputs">{entryInfo}</textarea>
            </div>
        </div>
        <br>
        <div class="flex justify-around w-[35%] m-auto">
            <button onclick={saveEdits} class="koho text-[20px] bg-[#FFDBE6] hover:bg-[#FFC8D7] pink-btn rounded-[18px] hover:bg-[#FFC8D7]">Save</button>
            <button onclick={cancelEdits} class="koho text-[20px] bg-[#FFDBE6] hover:bg-[#FFC8D7] pink-btn rounded-[18px] hover:bg-[#FFC8D7]">Cancel</button>
        </div>
        <p>{errMsg}</p>
    </div>

    <div bind:this={deletionConfirmation} class="hidden h-[90vh]">
        <div class="bg-[#FFF8E6] del-div m-auto rounded-[20px] border-box p-[30px]">
            <h1 class="koulen text-[35px] text-center">Are you sure you want to delete this entry?</h1>
            <h2 class="koulen text-[40px] text-center text-red-500">This cannot be undone!!!</h2>
            <br>
            <br>
            <div class="flex justify-around h-[100px]">
                <button class="bg-[#C1ED96] hover:bg-[#ade675] rounded-[20px] text-[30px] koho del-btn" onclick={deleteEntry}>Yes</button>
                <button class="bg-[#f56262] hover:bg-[#f54949] rounded-[20px] text-[30px] koho del-btn" onclick={cancelDel}>No</button>
            </div>
        </div>
    </div>
</div>

<style>
    .koulen{
        font-family: "Koulen", sans-serif;
    }

    .koho{
        font-family: "koho", sans-serif;
    }

    .kaisei-tokumin{
        font-family: "kaisei-tokumin", serif;
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

    @keyframes img-1{
        from{width:45%;height:100%}
        to{width:47%;height:103%}
    }

    @keyframes img-2{
        to{width:45%;height:100%}
        from{width:47%;height:103%}
    }

    .img{
        width: 45%;
        height: 100%;
        animation: img-2 0.5s ease-out;
    }

    .img:hover{
        width: 47%;
        height: 103%;
        animation: img-1 0.5s ease-out;
    }

    @keyframes edit-inputs-1{
        from{width:90%;height:50px;}
        to{width:92%;height:53px;}
    }

    @keyframes edit-inputs-2{
        to{width:90%;height:50px;}
        from{width:92%;height:53px;}
    }

    .edit-inputs{
        width:90%;
        height:50px;
        animation: edit-inputs-2 0.5s ease-out;
    }
    
    .edit-inputs:hover{
        width:92%;
        height:53px;
        animation: edit-inputs-1 0.5s ease-out;
    }

    @keyframes del-div-1{
        from{width:60vw;height:80vh}
        to{width:63vw;height:83vh}
    }

    @keyframes del-div-2{
        to{width:60vw;height:80vh}
        from{width:63vw;height:83vh}
    }


    .del-div{
        width:60vw;
        height:80vh;
        animation: del-div-2 0.5s ease-out;
    }

    .del-div:hover{
        width:63vw;
        height:83vh;
        animation: del-div-1 0.5s ease-out;
    }

    @keyframes del-btn-1{
        from{width:48%;}
        to{width:51%;}
    }

    @keyframes del-btn-2{
        to{width:48%;}
        from{width:51%;}
    }

    .del-btn{
        width:48%;
        animation: del-btn-2 0.5s ease-out;
    }

    .del-btn:hover{
        width:51%;
        animation: del-btn-1 0.5s ease-out;
    }
</style>