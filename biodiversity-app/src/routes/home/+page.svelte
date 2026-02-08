<script lang="ts">
    import axios from "axios";

    let location:string = $state("");
    
    async function findAnimals(){
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(async (pos)=>{
                let geoapifyKey:string = geoapifyApiKey;
                let lat:number = pos.coords.latitude;
                let lon:number = pos.coords.longitude;
                let geoapifyReverse:string = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${geoapifyKey}`;

                let city:string = "";
                let postcode:string = "";

                await axios.get(geoapifyReverse)
                .then((response)=>{
                    city = response.data.features[0].properties.city;
                    postcode = response.data.features[0].properties.postcode;
                    location = response.data.features[0].properties.formatted;
                })
                .catch((e)=>{
                    location = e;
                });

                console.log(city);
                console.log(postcode);
                let geoapifyBoundingBox = `https://api.geoapify.com/v1/geocode/search?city=${city}&postcode=${postcode}&apiKey=${geoapifyKey}`;
                await axios.get(geoapifyBoundingBox)
                .then((response)=>{
                    let bounds:number[] = response.data.features[0].bbox;
                    let latBounds:string = `${bounds[1]},${bounds[3]}`;
                    let lonBounds:string = `${bounds[0]},${bounds[2]}`;
                    console.log(latBounds);
                    console.log(lonBounds);
                });
            });
        }
    }
</script>

<h1>Home</h1>
<button onclick={findAnimals}>Find Animals</button>
<p>{location}</p>