<script lang="ts">
    import { json } from "@sveltejs/kit";
    import type { PageProps } from "./$types";
    import { onDestroy, onMount } from "svelte";
    import axios from "axios";
    import { goto } from "$app/navigation";
    import { writable } from "svelte/store";
    import gsap from "gsap";
    import { ScrollTrigger,  ScrollToPlugin} from "gsap/all";

    import AnimalImage from "$lib/components/AnimalImage.svelte";

    let { data }:PageProps = $props();

    let scientificName = $state("");
    let endangeredStatus = $state("");
    let animalAbout = $state("");
    
    type Animal = {
        commonName: string,
        scientificName: string,
        status: string,
        statusCode: string,
        statusId: number,
        threats: Threat[],
        conservation: string[],
        mostRecentAssessment: number
    }
    let animalDict: Record<string, Animal> = {};
    let animalInfo:Animal;

    type Threat = {
        threatName: string,
        score: string,
        severity: string
    }
    let threatsDict: Record<string, Threat> = {};
    let threatsArr:Threat[] = $state([]);
    let conservationArr:string[] = $state([]);

    type Img = {
        imgSrc: string,
        imgAlt: string,
        attribution: string
    }
    let imgsArr:Img[] = $state([]);

    
    let index:number=$state(0);
    let lastIndex=$state(false);
    let interval:ReturnType<typeof setInterval>;

    function next(){
        index=(index+1)%imgsArr.length;
    }

    function transition(){
        if(index>=imgsArr.length-1){
            lastIndex=true;
            index=0;

            requestAnimationFrame(()=>{
                requestAnimationFrame(()=>{
                    lastIndex=false;
                });
            });
        }
    }

    onMount(async ()=>{
        gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

        const stored=localStorage.getItem("animalDict");
        if(stored!=null){
            animalDict = JSON.parse(stored);
            animalInfo = animalDict[data.commonName];
            scientificName = animalInfo.scientificName;
            endangeredStatus = animalInfo.status;
            try{
                getInfoAbout(animalInfo.commonName);
                getImages(animalInfo.scientificName);
                getConservation(animalInfo.commonName);
                if(animalDict[animalInfo.commonName].threats.length==0){
                    const response = (await axios.post("/api/iucnThreats",{
                        assessmentId: animalInfo.mostRecentAssessment
                    }));
                    let threats = response.data.msg.threats;
                    parseThreats(threats, animalInfo.commonName);
                }else{
                    threatsArr = animalDict[animalInfo.commonName].threats;
                }
                
            }catch(e){
                console.log(e);
            }
        }
        //gsap
        let animRunning = false;

        ScrollTrigger.create({
            trigger: "#threatInfo",
            start: "top bottom",
            end: "bottom top",
            onEnter:()=>{
                if(!animRunning){
                    animRunning=true;
                    gsap.to(window,{
                        scrollTo: "#threatInfo",
                        duration: 1.5,
                        ease: "power3.out",
                        onComplete:()=>{
                            animRunning=false;
                        }
                    });
                }
            }
        });

        ScrollTrigger.create({
            trigger: "#animalOverview",
            start: "bottom top",
            
            onLeaveBack:()=>{
                if(!animRunning){
                    animRunning=true;
                    gsap.to(window,{
                        scrollTo: "#animalOverview",
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

    function parseThreats(assessedThreats:any[], commonName:string):void{
        console.log(assessedThreats);
        assessedThreats.forEach(i=>{
                if(!i.description.en.toLowerCase().includes("unknown") && i.timing.toLowerCase()=="ongoing"){
                    threatsDict[i.description.en] = {
                        threatName: i.description.en,
                        score: i.score,
                        severity: i.severity
                    }
                    threatsArr.push(threatsDict[i.description.en]);
                }
            
        });
        animalDict[commonName].threats = threatsArr;
        const store = writable(animalDict);
        store.subscribe(val=>{
            localStorage.setItem("animalDict",JSON.stringify(val));
        });
    }

    async function getInfoAbout(commonName:string){
        const response = (await axios.post("/api/getWikipediaInfo",{
            name: commonName
        })).data.msg.query.pages;
        let wikiArr:string[] = response[Object.keys(response)[0]].extract.split("\n==");
        animalAbout = wikiArr[0];
        wikiArr.splice(0,1);
        let wikiRecord:Record<string, string> = {};
        wikiArr.forEach(i=>{
            wikiRecord[i.split("==")[0].trim()]=i.split("==")[1];
        });
    }
    
    async function getImages(scientificName:string){
        try{
            const response = (await axios.get(`https://api.inaturalist.org/v1/taxa?q=${scientificName.split(" ").join("%20")}`)).data;
            if(response.results.length<5){
                for(let i:number = 0; i < response.results.length; i++){
                    imgsArr.push({
                        imgSrc: response.results[i].default_photo.medium_url,
                        imgAlt: scientificName,
                        attribution: response.results[i].default_photo.attribution.replaceAll("uploaded by", "uploaded to INaturalist by")
                    })
                }
            }else{
                for(let i:number = 0; i < 5; i++){
                    imgsArr.push({
                        imgSrc: response.results[i].default_photo.medium_url,
                        imgAlt: scientificName,
                        attribution: response.results[i].default_photo.attribution.replaceAll("uploaded by", "uploaded to INaturalist by")
                    })
                }
            }
            if(response.results.length>1){
                imgsArr.push(imgsArr[0]);
                interval=setInterval(next, 5000);
            }
        }catch(e){
            console.log(e);
        }
    }

    onDestroy(()=>{
        clearInterval(interval);
    })

    async function getConservation(commonName:string){
        if(animalDict[commonName].conservation.length==0){
            const conservationActions = (await axios.post("/api/getConservation",{
                threats: threatsArr,
                animal: commonName
            })).data.msg;
            conservationArr = conservationActions.split("!SEPARATE!");
            animalDict[commonName].conservation = conservationArr;
            const store = writable(animalDict);
            store.subscribe(val=>{
                localStorage.setItem("animalDict",JSON.stringify(val));
            });
        }else{
            conservationArr = animalDict[commonName].conservation;
        }
    }

    function rdrctHome(){
        goto("../home");
    }
</script>

<div class="bg-[#E1FFC4] box-border p-[20px]" id="screen">
    <div class="h-[100vh]" id="animalOverview">
        <button onclick={rdrctHome} class="koho text-[24px] bg-[#FFDBE6] w-[160px] h-[40px] rounded-[18px] hover:bg-[#FFC8D7]">Home</button>
        <h1 class="koulen text-center text-[45px] leading-[30px]">{data.commonName}</h1>
        <h3 class="kaisei-tokumin text-[24px] text-center">({scientificName})</h3>
        <br>
        <div class="flex justify-around">
            <div class="overflow-hidden w-[45vw]">
                <div class="flex transition-transform duration-500" class:transition-transform={!lastIndex} class:duration-500={!lastIndex} class:ease-out={!lastIndex} style="transform: translateX(-{index*100}%" ontransitionend={transition}>
                    {#each imgsArr as animalImg}
                        <AnimalImage {...animalImg}/>
                    {/each}
                </div>
            </div>
            <div class="w-[48vw] h-[65vh] overflow-auto scrollbar">
                <p class="koho text-[18px]">{animalAbout}</p>
                <a href={`https://en.wikipedia.org/wiki/${data.commonName.split(" ").join("_")}`} title={`Wikipedia article on ${data.commonName}`} target="_blank" class="underline text-[#ff14a9]">Read more on Wikipedia</a>
            </div>
        </div>
    </div>

    <br>
    <br>

    <div class="h-[95vh]" id="threatInfo">
        <h3 class="text-center text-[40px] kaisei-tokumin">Current Status: {endangeredStatus}</h3>
        <br>
        <div class="flex justify-around">
            <div class="bg-[#FFFAED] yellowDiv overflow-auto rounded-[25px] box-border p-[15px]">
                <h2 class="koulen text-[40px] text-center">Threats</h2>
                <ul>
                    {#each threatsArr as threatElement}
                        <li class="koho text-[22px]">{`${threatElement.threatName}`}</li>
                    {/each}
                </ul>
            </div>

             <div class="bg-[#FFFAED] yellowDiv overflow-auto rounded-[25px] p-[15px]">
                <h2 class="koulen text-[40px] text-center">Conservation Actions</h2>
                <ul>
                    {#each conservationArr as conservationAction}
                        <li>{`${conservationAction}`}</li>
                    {/each}
                </ul>
            </div>
        </div>
    </div>
</div>

<style>
    .koulen{
        font-family: "Koulen", sans-serif;
    }

    .kaisei-tokumin{
        font-family: "Kaisei Tokumin", serif;
    }

    .koho{
        font-family: "KoHo", sans-serif;
    }

    .scrollbar{
        scrollbar-width: thin;
        scrollbar-color: #FFDBE6 white;
    }

    @keyframes yellowDiv-1{
        from{width:45vw;height:80vh}
        to{width:48vw;height:80vh}
    }

    @keyframes yellowDiv-2{
        to{width:45vw;height:80vh}
        from{width:48vw;height:80vh}
    }

    .yellowDiv{
        width: 45vw;
        height: 80vh;
        animation: yellowDiv-2 0.5s ease-out;
    }

    .yellowDiv:hover{
        width: 48vw;
        height: 80vh;
        animation: yellowDiv-1 0.5s ease-out;
    }
</style>