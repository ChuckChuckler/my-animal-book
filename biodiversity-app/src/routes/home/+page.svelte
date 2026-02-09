<script lang="ts">
    import axios from "axios";

    let location:string = $state("");
    
    async function findAnimals(){
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(async (pos)=>{
                let geoapifyKey:string = GeoapifyApiKey;
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

                await axios.get(geoapifyBoundingBox)
                .then((response)=>{
                    let bounds:number[] = response.data.features[0].bbox;
                    let latBoundMin:number = bounds[1];
                    let latBoundMax:number = bounds[3];
                    let lonBoundMin:number = bounds[0];
                    let lonBoundMax:number = bounds[2];

                    //(min lon min lat, max lon min lat, max lon max lat, min lon max lat, min lon min lat)
                    let gbifGeom:string = `POLYGON((${lonBoundMin}%20${latBoundMin},${lonBoundMax}%20${latBoundMin},${lonBoundMax}%20${latBoundMax},${lonBoundMin}%20${latBoundMax},${lonBoundMin}%20${latBoundMin}))`;

                    return `https://api.gbif.org/v1/occurrence/search?taxonKey=1&geometry=${gbifGeom}&limit=100000&iucnRedListCategory=CR&iucnRedListCategory=EN&iucnRedListCategory=VU`;
                })
                .then(async (gbifUrl)=>{
                    let iucnRedListCategories = ["CR", "EN", "VU", "NT", "CD", "LC"];
                    let speciesFound:string[] = [];
                    let animals = (await axios.get(gbifUrl)).data.results;
                    for(let i:number = 0; i < animals.length; i++){
                        if(!speciesFound.includes(animals[i].species)){
                            speciesFound.push(animals[i].species);
                        }
                    }

                    speciesFound.forEach(i => {
                        console.log(i);
                    });
                })
                .catch((e)=>{
                    location=e;
                });
            });
        }
    }
</script>

<h1>Home</h1>
<button onclick={findAnimals}>Find Animals</button>
<p>{location}</p>