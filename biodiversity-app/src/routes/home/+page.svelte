<script lang="ts">
    import axios from "axios";
    import { writable } from "svelte/store";
    import { onMount } from "svelte";
    import Animal from "$lib/components/Animal.svelte";
    import { PUBLIC_GEOAPIFY_KEY } from "$env/static/public";
    import { goto } from "$app/navigation";
    
    let pfpButton:any;

    let location:string=$state("");
    let username:string=$state("");
    let userPfp:string=$state("");

    let endangeredLoadStatus:string=$state("");

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

    onMount(async ()=>{
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
            const pfp = (await axios.post("/api/getUserPfp", {username:username})).data.msg;
            userPfp = pfp;
            pfpButton.addEventListener("click", ()=>{
                goto(`userProfile/${username}`);
            })
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
        endangeredLoadStatus="hidden";
        Object.keys(animalDict).forEach(i=>{
            animalsElements.push(animalDict[i]);
        });
    }

    function rdrctDetect(){
        goto("animalBook");
    }
</script>
<div class="bg-linear-to-b from-[#E1FFC4] to-[#BEFF66] h-[100vh] overflow-hidden">
    <div class="flex w-[95vw] h-[23vh] m-auto justify-around">
        <div class="w-[40%] m-auto">
            <div class="flex justify-around w-[100%]">
                <img src={userPfp} alt="user profile" class="pfp rounded-full aspect-square object-cover" bind:this={pfpButton}>
                <div class="m-auto">
                    <h1 class="text-[34px] koulen">Welcome, {username}!</h1>
                    <h2 class="text-[20px] kaisei-tokumin">What animals can we find today?</h2>
                </div>
            </div>
        </div>
        <button onclick={rdrctDetect} class="nav-btns bg-[#FFDBE6] hover:bg-[#FFC8D7] rounded-[23px] m-auto koho text-[25px]">Animal Book</button>
        <button class="nav-btns bg-[#FFDBE6] hover:bg-[#FFC8D7] rounded-[23px] m-auto koho text-[25px]">Blog</button>
    </div>
    <br>
    <div class="w-[95%] h-[74vh] flex justify-around m-auto">
        <div class="bg-[#FFFAED] h-[95%] w-[69%] rounded-[28px] box-border p-[25px] overflow-auto scrollbar">
            <h1 class="text-center text-[20px] kaisei-tokumin">Endangered Animals In Your Area</h1>
            <br>
            <div class="grid grid-cols-2 gap-5">
                <h3 class={endangeredLoadStatus}>Loading...</h3>
                {#each animalsElements as animalElement}
                    <Animal commonName={animalElement.commonName} scientificName={animalElement.scientificName} threatLevel={animalElement.status} id={animalElement.commonName.split(" ").join("%20")} imgSrc={animalElement.imgSrc}></Animal>
                {/each}
            </div>
        </div>
        <div class="bg-[#FFF7E4] w-[25%] h-[95%] rounded-[28px] p-[15px] text-center">
            <h1 class="text-center kaisei-tokumin text-[28px]">Resources</h1>
            <br>
            <a href="https://www.inaturalist.org/" class="koho text-[22px]">INaturalist</a>
            <br>
            <a href="https://www.iucnredlist.org/" class="koho text-[22px]">IUCN Red List</a>
            <br>
            <a href="https://www.gbif.org/" class="koho text-[22px]">GBIF</a>
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

    @keyframes pfp-1{
        from{width: 120px; height: 120px;}
        to{width: 125px; height: 125px;}
    }

    @keyframes pfp-2{
        to{width: 120px; height: 120px;}
        from{width: 125px; height: 125px;}
    }

    .pfp{
        width: 120px;
        height: 120px;
        animation: pfp-2 0.5s ease-out;
    }

    .pfp:hover{
        width: 125px;
        height: 125px;
        animation: pfp-1 0.5s ease-out;
    }

    @keyframes nav-btns-1{
        to{width:26%;height:100px}
        from{width:25%;height:98px}
    }

    @keyframes nav-btns-2{
        from{width:26%;height:100px}
        to{width:25%;height:98px}
    }

    .nav-btns{
        width: 25%;
        height: 98px;
        animation: nav-btns-2 0.5s ease-out;
    }

    .nav-btns:hover{
        width: 26%;
        height: 98px;
        animation: nav-btns-1 0.5s ease-out;
    }

    .scrollbar{
        scrollbar-width: thin;
        scrollbar-color: #FFDBE6 white;
    }
</style>