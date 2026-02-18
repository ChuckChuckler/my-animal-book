<script lang="ts">
    import axios from "axios";
    import type { PageProps } from "./$types";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";

    let { data }:PageProps = $props();

    let newImageInput:any;

    let userDisplay:string=$state("block");
    let editingInterface:string=$state("hidden");

    let userPfp:string=$state("");
    let userStatus:string=$state("");
    let userBio:string=$state("");

    let editVisibility:string=$state("hidden");

    let newBio:string=$state("");
    let newUserPfp:string=$state("");

    onMount(async ()=>{
        let currentClient = document.cookie.split("=")[1];

        const fetchedInfo = (await axios.post("/api/getUserInfo", {username: data.username})).data;
        if(fetchedInfo.msg=="success"){
            userPfp=fetchedInfo.profilePicture,
            newUserPfp=fetchedInfo.profilePicture,
            userStatus=fetchedInfo.status,
            userBio=fetchedInfo.bio,
            newBio=fetchedInfo.bio
        }else{
            console.log(fetchedInfo.msg);
        }
        
        if(data.username===currentClient){
            editVisibility="block";
        }
    });

    function home(){
        goto("../home");
    }

    function showEditInterface(){
        userDisplay="hidden";
        editingInterface="block";
    }

    function cancelEdits(){
        userDisplay="block";
        editingInterface="hidden";
        newBio="";
        newImageInput.value = "";
    }

    async function createB64(includeData:boolean):Promise<string>{
        return new Promise((resolve, reject)=>{
            let b64:any="";
            if(newImageInput.files[0]!=undefined){
                const reader = new FileReader();
                reader.onloadend=()=>{
                    b64 = reader.result;
                    if(b64!=null){
                        if(!includeData){
                            b64=b64.replace("data:","").replace(/^.+,/, "");
                        }
                        resolve(b64);
                    }else{
                        resolve("null");
                    }
                }
                reader.readAsDataURL(newImageInput.files[0]);
            }else{
                resolve("null");
            }
        })
    }

    async function saveEdits(){
        if(newUserPfp!=userPfp || newBio!=userBio){
            await axios.post("/api/editUserInfo", {
                username:data.username,
                pfp: newUserPfp,
                bio: newBio
            })
            .then(()=>{
                location.reload();
            });
        }else{
            console.log("wowowowowoah");
        }
    }

    async function showNewImg(){
        createB64(true)
        .then(b64=>{
            if(b64=="null"){
                newUserPfp=userPfp;
            }else{
                newUserPfp=b64;
            }
        })
    }
</script>

<button onclick={home}>Back to home</button>

<div class={`${userDisplay}`}>
    <div class="flex">
        <img src={userPfp} alt="user profile" class="w-[200px] rounded-full object-cover aspect-square">
        <h1>{data.username}</h1>
    </div>
    <div class="flex">
        <p>{userStatus}</p>
        <button>Edit status</button>
    </div>
    <br>
    <p>{userBio}</p>
    <br>
    <button class={`${editVisibility}`} onclick={showEditInterface}>Edit</button>
</div>

<div class={`${editingInterface}`}>
    <h1>{data.username}</h1>
    <img src={newUserPfp} alt="user profile" class="w-[200px] rounded-full object-cover aspect-square">
    <label for="editImage">Edit image: </label>
    <input type="file" accept="image/*" bind:this={newImageInput} id="editImage" onchange={showNewImg}>
    <br>
    <br>
    <label for="editBio">Edit bio:</label>
    <br>
    <textarea id="editBio" bind:value={newBio}></textarea>
    <br>
    <br>
    <button onclick={saveEdits}>Save</button>
    <button onclick={cancelEdits}>Cancel</button>
</div>