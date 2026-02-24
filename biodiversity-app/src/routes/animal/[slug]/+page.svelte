<script lang="ts">
    import { json } from "@sveltejs/kit";
    import type { PageProps } from "./$types";
    import { onMount } from "svelte";
    import axios from "axios";
    import { goto } from "$app/navigation";
    import { writable } from "svelte/store";

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
        attribution: string,
        display: string
    }
    let imgsArr:Img[] = $state([]);

    async function sleep(ms:number):Promise<void> {
        return new Promise(
            (resolve)=>setTimeout(resolve, ms)
        );
    }

    onMount(async ()=>{
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
    });

    function parseThreats(assessedThreats:any[], commonName:string):void{
        assessedThreats.forEach(i=>{
            if(i.severity!=undefined && i.score!=undefined){
                if(!i.severity.toLowerCase().includes("unknown") && !i.description.en.toLowerCase().includes("unknown") && !i.score.toLowerCase().includes("unknown")){
                    threatsDict[i.description.en] = {
                        threatName: i.description.en,
                        score: i.score,
                        severity: i.severity
                    }
                    threatsArr.push(threatsDict[i.description.en]);
                }
            }else{
                if(!i.description.en.toLowerCase().includes("unknown")){
                    threatsDict[i.description.en] = {
                        threatName: i.description.en,
                        score: i.score,
                        severity: i.severity
                    }
                    threatsArr.push(threatsDict[i.description.en]);
                }
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
            wikiRecord[i.split("==")[0].trim()]=i.split("==")[1].replaceAll("\n","");
        });
    }
    
    async function getImages(scientificName:string){
        try{
            const response = (await axios.get(`https://api.inaturalist.org/v1/taxa?q=${scientificName.split(" ").join("%20")}`)).data;
            if(response.results.length<5){
                for(let i:number = 0; i < response.results.length; i++){
                    let display = "";
                    if(i==0){
                        display = "block";
                    }else{
                        display = "hidden";
                    }
                    imgsArr.push({
                        imgSrc: response.results[i].default_photo.medium_url,
                        imgAlt: scientificName,
                        attribution: response.results[i].default_photo.attribution.replaceAll("uploaded by", "uploaded to INaturalist by"),
                        display: display
                    })
                }
            }else{
                for(let i:number = 0; i < 5; i++){
                    let display = "hidden";
                    if(i==0){
                        display = "block";
                    }
                    imgsArr.push({
                        imgSrc: response.results[i].default_photo.medium_url,
                        imgAlt: scientificName,
                        attribution: response.results[i].default_photo.attribution.replaceAll("uploaded by", "uploaded to INaturalist by"),
                        display: display
                    })
                }
            }
            cycleImages(response.results.length);
        }catch(e){
            console.log(e);
        }
    }

    let index:number=0;

    async function cycleImages(numImages:number){
        while(true){
            await sleep(3000);

            /*console.log(document.getElementById(`animalImage${index}`));

            let obj:any = document.getElementById(`animalImage${index}`);
            if(obj!=null){
                obj.display = "none";
            }

            if(index==numImages){
                index=0;
            }else{
                index+=1;
            }

            obj = document.getElementById(`animalImage${index}`);
            if(obj!=null){
                obj.display = "block";
            }*/
        }
    }

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

<div class="bg-[#E1FFC4] box-border p-[20px]">
    <button onclick={rdrctHome} class="koho text-[24px] bg-[#FFDBE6] w-[160px] h-[40px] rounded-[18px] hover:bg-[#FFC8D7]">Home</button>
    <h1 class="koulen text-center text-[45px] leading-[30px]">{data.commonName}</h1>
    <h3 class="kaisei-tokumin text-[24px] text-center">({scientificName})</h3>
    <br>
    <div class="flex justify-around">
        <div>
            {#each imgsArr as animalImg}
                <AnimalImage imgSrc={animalImg.imgSrc} imgAlt={animalImg.imgAlt} attribution={animalImg.attribution} display={animalImg.display} id={`animalImage${imgsArr.indexOf(animalImg)}`}></AnimalImage>
            {/each}
        </div>
        <div class="w-[48vw] h-[65vh] overflow-auto scrollbar">
            <p class="koho text-[18px]">{animalAbout}</p>
            <a href={`https://en.wikipedia.org/wiki/${data.commonName.split(" ").join("_")}`} title={`Wikipedia article on ${data.commonName}`} target="_blank" class="underline text-[#ff14a9]">Read more on Wikipedia</a>
        </div>
    </div>

    <br>
    <h3>{endangeredStatus}</h3>
    <h2>Threats</h2>
    <ul>
        {#each threatsArr as threatElement}
            <li>{`${threatElement.threatName}`}</li>
        {/each}
    </ul>
    <br>
    <h2>Conservation Actions</h2>
    <ul>
        {#each conservationArr as conservationAction}
            <li>{`${conservationAction}`}</li>
        {/each}
    </ul>
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
</style>