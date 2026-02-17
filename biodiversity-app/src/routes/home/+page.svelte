<script lang="ts">
    import axios from "axios";
    import { writable } from "svelte/store";
    import { onMount } from "svelte";
    import Animal from "$lib/components/Animal.svelte";
    import { PUBLIC_GEOAPIFY_KEY } from "$env/static/public";
    import { goto } from "$app/navigation";

    let location:string = $state("");
    let username:string=$state("");

    type Animal = {
        commonName: string,
        scientificName: string,
        status: string,
        statusCode: string,
        statusId: number,
        threats: unknown,
        conservation: string[],
        mostRecentAssessment: number,
        imgSrc: any
    }

    let animalDict: Record<string, Animal> = {};

    let animalsElements:Animal[] = $state([]);

    const endangeredCodes: Record<string, string> = {
        "CR":"Critically Endangered",
        "EN":"Endangered",
        "VU":"Vulnerable",
        "NT":"Near Threatened"
    };

    onMount(()=>{
        if(document.cookie.length==0){
            goto("");
        }else{
            username=document.cookie.split("=")[1];
            const stored=localStorage.getItem("animalDict");
            if(stored==null){
                findAnimals();
            }else{
                animalDict = JSON.parse(stored);
                createAnimals();
            }
        }
    })
    
    async function findAnimals(){
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(async (pos)=>{
                let geoapifyKey:string = PUBLIC_GEOAPIFY_KEY;
                let city:string = "";
                let postcode:string = "";

                let lat:number = pos.coords.latitude;
                let lon:number = pos.coords.longitude;
                let geoapifyReverse:string = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${geoapifyKey}`;

                await axios.get(geoapifyReverse)
                .then((response)=>{
                    city = response.data.features[0].properties.city;
                    postcode = response.data.features[0].properties.postcode;
                    location = response.data.features[0].properties.formatted;
                })
                .catch((e)=>{
                    location = e;
                });

                let geoapifyBoundingBox:string = `https://api.geoapify.com/v1/geocode/search?city=${city}&postcode=${postcode}&apiKey=${geoapifyKey}`;

                try{
                    const response = (await axios.get(geoapifyBoundingBox));
                    let bounds:number[] = response.data.features[0].bbox;
                    let latBoundMin:number = bounds[1];
                    let latBoundMax:number = bounds[3];
                    let lonBoundMin:number = bounds[0];
                    let lonBoundMax:number = bounds[2];

                    //(min lon min lat, max lon min lat, max lon max lat, min lon max lat, min lon min lat)
                    let gbifGeom:string = `POLYGON((${lonBoundMin}%20${latBoundMin},${lonBoundMax}%20${latBoundMin},${lonBoundMax}%20${latBoundMax},${lonBoundMin}%20${latBoundMax},${lonBoundMin}%20${latBoundMin}))`;
                    let gbifUrl:string = `https://api.gbif.org/v1/occurrence/search?taxonKey=1&geometry=${gbifGeom}&limit=100000&iucnRedListCategory=CR&iucnRedListCategory=EN&iucnRedListCategory=VU`;

                    let speciesList = await getAnimals(gbifUrl);
                    let assessments = await composeAnimalDict(speciesList);

                    const store = writable(animalDict);
                    store.subscribe(val=>{
                        localStorage.setItem("animalDict",JSON.stringify(val));
                    });
                    //getThreatsConservation(assessments);
                }catch(e){
                    console.log(e);
                }

            })
        }
    }

    async function getAnimals(gbifUrl:string){
        let speciesFound:string[] = [];
        let animals = (await axios.get(gbifUrl)).data.results;
        for(let i:number = 0; i < animals.length; i++){
            if(!speciesFound.includes(animals[i].species)){
                speciesFound.push(animals[i].species);
            }
        }

        if(speciesFound.length < 15){
            let animals = (await axios.get(gbifUrl.replace("iucnRedListCategory=CR&iucnRedListCategory=EN&iucnRedListCategory=VU", "iucnRedListCategory=NT"))).data.results;
            for(let i:number = 0; i < animals.length; i++){
                if(!speciesFound.includes(animals[i].species)){
                    speciesFound.push(animals[i].species);
                }
            }
        }

        return speciesFound;
    }

    async function composeAnimalDict(species:string[]){
        let assessmentIds:string[] = [];
        for(const i of species){
            let tempSpeciesArr:string[] = i.split(" ");
            let genus = tempSpeciesArr[0];
            let speciesName = tempSpeciesArr[1];

            try{
                const response = (await axios.post("/api/iucnTaxon",{
                    genus: genus,
                    species: speciesName
                })).data.msg;

                let iucnTaxonData = response.taxon;
                let iucnAssessmentData = response.assessments[0];
                assessmentIds.push(iucnAssessmentData.assessment_id);

                let iucnCodes = ["CR", "EN", "VU", "NT", "CD", "LC"];
                let commonNames = iucnTaxonData.common_names;

                let imgSrc = await getImage(`${genus} ${speciesName}`);

                for(let i:number = 0; i < commonNames.length; i++){
                    if(commonNames[i].language === "eng"){
                        animalDict[commonNames[i].name] = {
                            commonName: commonNames[i].name,
                            scientificName: `${genus} ${speciesName}`,
                            status: endangeredCodes[iucnAssessmentData.red_list_category_code],
                            statusCode: iucnAssessmentData.red_list_category_code,
                            statusId: iucnCodes.indexOf(iucnAssessmentData.red_list_category_code),
                            threats: [],
                            conservation: [],
                            mostRecentAssessment: iucnAssessmentData.assessment_id,
                            imgSrc: imgSrc
                        }
                        break;
                    }
                }
            }catch(e){
                return ["error", e];
            }
        }
        let sortedAnimalDict = Object.entries(animalDict).sort((a,b)=>animalDict[a[0]].statusId-animalDict[b[0]].statusId);
        animalDict = Object.fromEntries(sortedAnimalDict);
        createAnimals();
        return assessmentIds;
    }

    async function getImage(scientificName:string){
        try{
            const response = (await axios.get(`https://api.inaturalist.org/v1/taxa?q=${scientificName.split(" ").join("%20")}`)).data;
            return response.results[0].default_photo.square_url;
        }catch(e){
            return e;
        }
    }

    function createAnimals(){
        Object.keys(animalDict).forEach(i=>{
            animalsElements.push(animalDict[i]);
        });
    }

    function rdrctDetect(){
        goto("animalBook");
    }
</script>

<h1>Welcome, {username}!</h1>
<button onclick={rdrctDetect}>Detect</button>
<br>
<div>
    {#each animalsElements as animalElement}
        <Animal commonName={animalElement.commonName} scientificName={animalElement.scientificName} threatLevel={animalElement.status} id={animalElement.commonName.split(" ").join("%20")} imgSrc={animalElement.imgSrc}></Animal>
        <br>
    {/each}
</div>