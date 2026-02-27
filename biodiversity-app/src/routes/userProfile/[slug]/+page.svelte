<script lang="ts">
    import axios from "axios";
    import type { PageProps } from "./$types";
    import { onMount, tick, onDestroy } from "svelte";
    import { goto } from "$app/navigation";
    import AnimalBook from "$lib/components/AnimalBook.svelte";
    import gsap from "gsap";
    import { ScrollTrigger,  ScrollToPlugin} from "gsap/all";

    import editBtn from "$lib/assets/editBtn.png";

    let { data }:PageProps = $props();

    let newImageInput:any;

    let userDisplay:string=$state("block");
    let editingInterface:string=$state("hidden");

    let userPfp:string=$state("");
    let userStatus:string=$state("");
    let userBio:string=$state("");
    let statusDisplay:string=$state("");

    let editVisibility:string=$state("hidden");
    let statusEditor:string=$state("hidden");
    let statusEditorBtn:string=$state("hidden");

    let newBio:string=$state("");
    let newUserPfp:string=$state("");
    let newStatus:string=$state("");

    let ctx:any;

    onMount(async ()=>{
        gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

        let currentClient = document.cookie.split("=")[1];

        const fetchedInfo = (await axios.post("/api/getUserInfo", {username: data.username})).data;
        if(fetchedInfo.msg=="success"){
            userPfp=fetchedInfo.profilePicture,
            newUserPfp=fetchedInfo.profilePicture,
            userStatus=fetchedInfo.status,
            newStatus=fetchedInfo.status,
            userBio=fetchedInfo.bio,
            newBio=fetchedInfo.bio
        }else{
            console.log(fetchedInfo.msg);
        }
        
        if(data.username===currentClient){
            editVisibility="block";
            statusEditorBtn="block";
        }

        await tick();
        ctx=gsap.context(()=>{
            let animRunning=false;

            ScrollTrigger.create({
                trigger:"#userBookSection",
                start: "top bottom",
                end: "bottom top",
                onEnter:()=>{
                    if(!animRunning){
                        animRunning=true;
                        gsap.to(window,{
                            scrollTo: "#userBookSection",
                            duration: 1.5,
                            ease:"power3.out",
                            onComplete:()=>{
                                animRunning=false;
                            }
                        });
                    }
                }
            });

            ScrollTrigger.create({
                trigger:"#userInfoSection",
                start: "bottom top",
                onLeaveBack:()=>{
                    if(!animRunning){
                        animRunning=true;
                        gsap.to(window,{
                            scrollTo: "#homeButton",
                            duration: 1.5,
                            ease: "power3.out",
                            onComplete:()=>{
                                animRunning=false;
                            }
                        });
                    }
                }
            });
        });
    });

    onDestroy(()=>{
        ctx?.revert();
        ScrollTrigger.killAll();
    })

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
                bio: newBio,
                status: "not changed"
            })
            .then(()=>{
                location.reload();
            });
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

    function editStatus(){
        statusEditor="block";
        statusEditorBtn="hidden";
        statusDisplay="hidden";
    }
    
    async function saveStatus(){
        await axios.post("/api/editUserInfo", {
            username:data.username,
            pfp: "not changed",
            bio: "not changed",
            status: newStatus
        })
        .then(()=>{
            userStatus=newStatus;
            statusEditor="hidden";
            statusDisplay="block";
            statusEditorBtn="block";
        });
    }
</script>

<div class="bg-[#E1FFC4] border-box p-[15px]">
    <button id="homeButton" onclick={home} class="koho text-[20px] bg-[#FFDBE6] hover:bg-[#FFC8D7] pink-btn rounded-[18px] hover:bg-[#FFC8D7]">Home</button>
    <br>
    <br>
    <div class="{userDisplay}">
        <div class="h-[100vh]" id="userInfoSection">
            <div class="flex justify-start">
                <img src={userPfp} alt="user profile" class="w-[200px] rounded-full object-cover aspect-square">
                <div class="mt-auto mb-auto ml-[15px]">
                    <h1 class="koulen text-[40px]">{data.username}</h1>
                    <div class="grid grid-cols-2">
                        <p class="{statusDisplay} w-[100%] koho text-[25px]">{userStatus}</p>
                        <button class="{statusEditorBtn} ml-[10px]" onclick={editStatus}><img src={editBtn} alt="edit" class="w-[20px] h-[20px]"></button>
                        <input class="bg-[#FFFAED] pl-[15px] {statusEditor} h-[10vh] rounded-full" type="text" bind:value={newStatus}>
                        <button class="{statusEditor} koho text-[20px] bg-[#FFDBE6] hover:bg-[#FFC8D7] pink-btn rounded-[18px] hover:bg-[#FFC8D7] m-auto" onclick={saveStatus}>Save</button>
                    </div>
                </div>
            </div>
            <br>
            <hr>
            <br>
            <p class="koho text-[20px] h-[25vh]">{userBio}</p>
            <br>
            <button class="{editVisibility} koho text-[20px] bg-[#FFDBE6] hover:bg-[#FFC8D7] pink-btn rounded-[18px] hover:bg-[#FFC8D7] m-auto" onclick={showEditInterface}>Edit</button>
        </div>
        <div class="h-[100vh]" id="userBookSection">
            <br>
            <br>
            <div>
                <h1 class="text-center text-[40px] koulen">{data.username}'s Animal Book</h1>
                <div>
                    <AnimalBook bookOwner={`${data.username}`} ownerIsUser={false} clickable={false}></AnimalBook>
                </div>
            </div>
        </div>
    </div>

    <div class="{editingInterface}">
        <img src={newUserPfp} alt="user profile" class="w-[200px] rounded-full object-cover aspect-square">
        <label for="editImage" class="koho text-[25px]">Edit image: </label>
        <input type="file" accept="image/*" bind:this={newImageInput} id="editImage" onchange={showNewImg} class="bg-[#FFFAED] rounded-full block pr-[15px] koho text-[20px] file-input relative">
        <br>
        <br>
        <label for="editBio" class="koho text-[25px]">Edit bio:</label>
        <br>
        <textarea id="editBio" class="bg-[#FFFAED] w-[40%] h-[100px] p-[5px] border-box" bind:value={newBio}></textarea>
        <br>
        <br>
        <div class="flex justify-around w-[30%]">
            <button class="koho text-[20px] bg-[#FFDBE6] hover:bg-[#FFC8D7] pink-btn rounded-[18px] hover:bg-[#FFC8D7] m-auto" onclick={saveEdits}>Save</button>
            <button class="koho text-[20px] bg-[#FFDBE6] hover:bg-[#FFC8D7] pink-btn rounded-[18px] hover:bg-[#FFC8D7] m-auto" onclick={cancelEdits}>Cancel</button>
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

    @keyframes file-input-1{
        from{height:40px;width:30%}
        to{height:42px;width:32%}
    }

    @keyframes file-input-2{
        to{height:40px;width:30%}
        from{height:42px;width:32%}
    }

    .file-input{
        height:40px;
        width:30%;
        animation: file-input-2 0.5s ease-out;
    }

    .file-input:hover{
        height:42px;
        width:32%;
        animation: file-input-1 0.5s ease-out;
    }

    .file-input::file-selector-button{
        background-color: #F0E1BA;
        width: 40%;
        left:0;
        height:100%;
    }

    .file-input::file-selector-button:hover{
        background-color: #f1dba2;
    }
</style>