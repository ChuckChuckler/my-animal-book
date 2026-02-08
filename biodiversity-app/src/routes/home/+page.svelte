<script lang="ts">
    import axios from "axios";

    let location:string = $state("");
    
    async function findAnimals(){
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(async (pos)=>{
                let geoapifyKey = GEOAPIFY_KEY;
                let geoapifyUrl = `https://api.geoapify.com/v1/geocode/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&apiKey=${geoapifyKey}`;
                await axios.get(geoapifyUrl)
                .then((response)=>{
                    location = response.data.features[0].properties.city;
                })
                .catch((e)=>{
                    location = e;
                })
            });
        }
    }
</script>

<h1>Home</h1>
<button onclick={findAnimals}>Find Animals</button>
<p>{location}</p>