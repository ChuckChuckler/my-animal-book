<script lang="ts">
    import axios from "axios";

    let location:string = $state("");

    type Animal = {
        status: string,
        statusId: number,
        threats: string
    }

    const animalDict: Record<string, Animal> = {};
    
    async function findAnimals(){
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(async (pos)=>{
                let geoapifyKey:string = GEOAPIFY_KEY;
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
                    console.log(animalDict);
                    console.log(assessments);
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

                for(let i:number = 0; i < commonNames.length; i++){
                    if(commonNames[i].language === "eng"){
                        animalDict[commonNames[i].name] = {
                            status: iucnAssessmentData.red_list_category_code,
                            statusId: iucnCodes.indexOf(iucnAssessmentData.red_list_category_code),
                            threats: "yes"
                        }
                        break;
                    }
                }
            }catch(e){
                return e;
            }
        }
        return assessmentIds;
    }

                        /*.then((assessmentId)=>{
                            console.log(assessmentId);
                            let stuff = (axios.post("/api/iucnThreats", {taxon:assessmentId}).data);
                            console.log(stuff.msg);
                        })
                    }
                })*/
</script>

<h1>Home</h1>
<button onclick={findAnimals}>Find Animals</button>
<p>{location}</p>