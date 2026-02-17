<script lang="ts">
    import { goto } from "$app/navigation";
    import { PUBLIC_GEOAPIFY_KEY } from "$env/static/public";
    import axios from "axios";

    let errMsg:any = $state("");
    let uploadedImg:string = $state("");

    let journalEntryFields = $state("hidden");

    let commonName = $state("?");
    let scientificName = $state("?");
    let foundWhere = $state("");
    let notes = $state("");

    let imgInput:any;
    function detect(){
        if(imgInput.files[0]!=undefined){
            let imagePreview = URL.createObjectURL(imgInput.files[0]);
            uploadedImg = imagePreview;
        }else{
            errMsg="Please upload an image";
        }
    }

    async function createB64(includeData:boolean):Promise<string>{
        return new Promise((resolve, reject)=>{
            let b64:any="";
            if(imgInput.files[0]!=undefined){
                const reader = new FileReader();
                reader.onloadend=()=>{
                    b64 = reader.result;
                    if(b64!=null){
                        if(!includeData){
                            b64=b64.replace("data:","").replace(/^.+,/, "");
                        }
                        resolve(b64);
                    }else{
                        reject("its null :(");
                    }
                }
                reader.readAsDataURL(imgInput.files[0]);
            }else{
                errMsg="Please upload an image";
                reject("no image uploaded!");
            }
        })
    }

    async function send(){
        createB64(false)
        .then(async b64=>{
            try{
                let countryCode = await getCountryCode();
                const response = (await axios.post("/api/detectAnimal", {
                    b64:b64,
                    cCode:countryCode,
                })).data.msg.annotations[0];
                journalEntryFields = journalEntryFields.replace("hidden", "block");
                commonName=response.label;
                scientificName=`${response.taxonomy.genus} ${response.taxonomy.species}`;
            }catch(e){
                errMsg=e;
            }
        })
        .catch(e=>{
            console.log(e);
        });
    }

    async function getCountryCode(){
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(async (pos)=>{
                let geoapifyKey:string = PUBLIC_GEOAPIFY_KEY;

                let lat:number = pos.coords.latitude;
                let lon:number = pos.coords.longitude;
                let geoapifyReverse:string = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${geoapifyKey}`;

                const country =  (await axios.get(geoapifyReverse)).data.features[0].properties.country_code;
                return country;
            })
        }
    }

    async function addEntry(){
        if(foundWhere==""){
            errMsg="Please add a location!";
        }else{
            createB64(true)
            .then(async b64=>{
                const response = (await axios.post("/api/addEntry",{
                    commonName: commonName,
                    scientificName: scientificName,
                    animalImage: b64,
                    found: foundWhere,
                    notes: notes,
                    username:document.cookie.split("=")[1]
                })).data;
                console.log(response.msg);
            })
            .catch(e=>{
                console.log(e);
            })
        }
    }

    function rdrctJournal(){
        goto("animalBook");
    }
    
</script>

<button onclick={rdrctJournal}>Return to journal</button>
<br>

<h1>Add Entry</h1>
<input type="file" accept="image/*" bind:this={imgInput} onchange={detect}>
<br>
<button onclick={send}>detect</button>
<br>
<img src={uploadedImg} alt="your uploaded img">
<br>
<br>
<div class={journalEntryFields}>
    <label for="commonName">Common Name</label>
    <br>
    <input type="text" name="commonName" id="commonName" autocomplete="off" bind:value={commonName}>
    <br>
    <br>
    <label for="scientificName">Scientific Name</label>
    <br>
    <input type="text" name="scientificName" id="scientificName" autocomplete="off" bind:value={scientificName}>
    <br>
    <br>
    <label for="foundWhere">Where was it found?</label>
    <br>
    <input type="text" name="foundWhere" id="foundWhere" autocomplete="off" bind:value={foundWhere}>
    <br>
    <br>
    <label for="notes">Notes</label>
    <br>
    <textarea id="notes" bind:value={notes}></textarea>
    <br>
    <button onclick={addEntry}>Add to Journal</button>
</div>
<p>{errMsg}</p>