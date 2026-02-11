<script lang="ts">
    import { json } from "@sveltejs/kit";
    import type { PageProps } from "./$types";
    import { onMount } from "svelte";
    import axios from "axios";

    let { data }:PageProps = $props();

    let scientificName = $state("");
    let endangeredStatus = $state("");
    
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
        score: string,
        severity: string
    }
    let threatsDict: Record<string, Threat> = {};

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
                let threats = response.data.msg.threats;
                parseThreats(threats);
                console.log(threatsDict);
            }catch(e){
                console.log(e);
            }
        }
    });

    function parseThreats(assessedThreats:any[]):void{
        assessedThreats.forEach(i=>{
            if(!i.severity.toLowerCase().includes("negligible") && !i.description.en.toLowerCase().includes("unknown")){
                threatsDict[i.description.en] = {
                    score: i.score,
                    severity: i.severity
                }
            }
        })
    }
</script>

<h1>{data.commonName}</h1>
<h3>{scientificName}</h3>
<h3>{endangeredStatus}</h3>