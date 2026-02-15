<script lang="ts">
    import { json } from "@sveltejs/kit";
    import type { PageProps } from "./$types";
    import { onMount } from "svelte";
    import axios from "axios";
    import { goto } from "$app/navigation";

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
            if(!i.severity.toLowerCase().includes("unknown") && !i.description.en.toLowerCase().includes("unknown") && !i.score.toLowerCase().includes("unknown")){
                threatsDict[i.description.en] = {
                    threatName: i.description.en,
                    score: i.score,
                    severity: i.severity
                }
                threatsArr.push(threatsDict[i.description.en]);
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
<h2>About</h2>
<p>{animalAbout}</p>
<br>
<h2>Threats</h2>
<ul>
    {#each threatsArr as threatElement}
        <li>{`${threatElement.threatName} - ${threatElement.severity}`}</li>
    {/each}
</ul>