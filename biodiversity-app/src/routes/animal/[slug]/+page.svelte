<script lang="ts">
    import { json } from "@sveltejs/kit";
    import type { PageProps } from "./$types";
    import { onMount } from "svelte";
    import axios from "axios";
    import { goto } from "$app/navigation";

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
        threats: unknown,
        conservation: unknown,
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

    type Img = {
        imgSrc: string,
        imgAlt: string,
        attribution: string
    }
    let imgsArr:Img[] = $state([]);

    onMount(async ()=>{
        const stored=localStorage.getItem("animalDict");
        if(stored!=null){
            animalDict = JSON.parse(stored);
            animalInfo = animalDict[data.commonName];
            scientificName = animalInfo.scientificName;
            endangeredStatus = animalInfo.status;
            try{
                const response = (await axios.post("/api/iucnThreats",{
                    assessmentId: animalInfo.mostRecentAssessment
                }));
                getInfoAbout(animalInfo.commonName);
                getImages(animalInfo.scientificName);
                let threats = response.data.msg.threats;
                console.log(threats);
                parseThreats(threats);
                console.log(threatsDict);
            }catch(e){
                console.log(e);
            }
        }
    });

    function parseThreats(assessedThreats:any[]):void{
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
        })
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
            for(let i:number = 0; i < 5; i++){
                imgsArr.push({
                    imgSrc: response.results[i].default_photo.medium_url,
                    imgAlt: scientificName,
                    attribution: response.results[i].default_photo.attribution.replaceAll("uploaded by", "uploaded to INaturalist by")
                })
                console.log(imgsArr);
            }
        }catch(e){
            console.log(e);
        }
    }

    function rdrctHome(){
        goto("../home");
    }
</script>

<button onclick={rdrctHome}>Home</button>
<br>
<h1>{data.commonName}</h1>
<h3>{scientificName}</h3>
<h3>{endangeredStatus}</h3>
<br>
<div>
    {#each imgsArr as animalImg}
        <AnimalImage imgSrc={animalImg.imgSrc} imgAlt={animalImg.imgAlt} attribution={animalImg.attribution}></AnimalImage>
    {/each}
</div>
<br>
<h2>About</h2>
<p>{animalAbout}</p>
<br>
<h2>Threats</h2>
<ul>
    {#each threatsArr as threatElement}
        <li>{`${threatElement.threatName}`}</li>
    {/each}
</ul>