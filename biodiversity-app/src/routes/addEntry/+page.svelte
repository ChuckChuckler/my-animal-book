<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount, tick, onDestroy } from "svelte";
    import { PUBLIC_GEOAPIFY_KEY } from "$env/static/public";
    import axios from "axios";
    import gsap from "gsap";
    import { ScrollTrigger,  ScrollToPlugin} from "gsap/all";

    let errMsg:any = $state("");
    let errMsg2:any=$state("");
    let uploadedImg:string = $state("");

    let uploadedImgDiv:string=$state("hidden");
    let journalEntryFields:string = $state("hidden");

    let journalAndInfoDiv:any;

    let commonNameUnedited:string = $state("");

    let commonName:string = $state("");
    let scientificName:string = $state("");
    let foundWhere:string = $state("");
    let notes:string = $state("");

    let threats:string[] = $state([]);
    let endStatus:string = $state("");
    let animalWikiInfo:string = $state("");

    let learnAboutDiv:string= $state("invisible");

    const endangeredCodes: Record<string, string> = {
        "CR":"Critically Endangered",
        "EN":"Endangered",
        "VU":"Vulnerable",
        "NT":"Near Threatened",
        "LC":"Least Concern",
        "NA":"Unknown/Least Concern"
    };

    let animRunning = false;

    let ctx:any;

    onMount(async ()=>{
        gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

        await tick();
        ctx=gsap.context(()=>{
            ScrollTrigger.create({
                trigger:"#journalAndInfo",
                start: "top bottom",
                end: "bottom bottom",
                onEnter:()=>{
                    if(!animRunning){
                        animRunning=true;
                        gsap.to(window,{
                            scrollTo: "#journalAndInfo",
                            duration: 1.5,
                            ease:"power3.out",
                            onComplete:()=>{
                                animRunning=false;
                            }
                        });
                    }
                }
            });

            ScrollTrigger.create({
                trigger:"#entryAddingDiv",
                start: "bottom top",
                onLeaveBack:()=>{
                    if(!animRunning){
                        animRunning=true;
                        gsap.to(window,{
                            scrollTo: "#entryAddingDiv",
                            duration: 1.5,
                            ease: "power3.out",
                            onComplete:()=>{
                                animRunning=false;
                            }
                        });
                    }
                }
            })
        })
    });

    onDestroy(()=>{
        ctx?.revert();
        ScrollTrigger.killAll();
    })

    let imgInput:any;
    function detect(){
        if(imgInput.files[0]!=undefined){
            let imagePreview = URL.createObjectURL(imgInput.files[0]);
            uploadedImg = imagePreview;
            uploadedImgDiv="block";
            learnAboutDiv="invisible";
            journalEntryFields="hidden";
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
        errMsg="Loading...";
        createB64(false)
        .then(async b64=>{
            try{
                let countryCode = await getCountryCode();
                const response = (await axios.post("/api/detectAnimal", {
                    b64:b64,
                    cCode:countryCode,
                })).data.msg.annotations[0];
                journalEntryFields = journalEntryFields.replace("hidden", "block");
                if(response!=undefined){
                    commonName=response.label;
                    commonNameUnedited=response.label;
                    scientificName=`${response.taxonomy.genus} ${response.taxonomy.species}`;
                    if(commonName!="" && scientificName!=""){
                        learnAboutDiv=`visible`;
                        await getInfo();
                        errMsg="";
                        if(typeof window !== "undefined"){
                            animRunning=true;
                            gsap.to(window,{
                                scrollTo: "#journalAndInfo",
                                duration: 1.5,
                                ease:"power3.out",
                                onComplete:()=>{
                                    animRunning=false;
                                }
                            });
                        }
                    }
                }
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
                await axios.post("/api/addEntry",{
                    commonName: commonName,
                    scientificName: scientificName,
                    animalImage: b64,
                    found: foundWhere,
                    notes: notes,
                    username:document.cookie.split("=")[1]
                })
                .then(()=>{
                    goto("animalBook");
                });
            })
            .catch(e=>{
                console.log(e);
            })
        }
    }

    async function getInfo(){
        try{
            const response = (await axios.post("/api/iucnTaxon",{
                genus: scientificName.split(" ")[0],
                species: scientificName.split(" ")[scientificName.split(" ").length-1]
            })).data.msg;

            endStatus = endangeredCodes[response.assessments[0].red_list_category_code];
            let iucnAssessmentDataId = response.assessments[0].assessment_id;

            const threatsResponse = (await axios.post("/api/iucnThreats", {
                assessmentId: iucnAssessmentDataId
            })).data.msg.threats;

            if(threatsResponse.length==0){
                threats.push("N/A");
            }else{
                for(let i:number=0;i<threatsResponse.length;i++){
                    threats.push(threatsResponse[i].description.en);
                }
            }

            const wikiInfo = (await axios.post("/api/getWikipediaInfo", {
                name: commonNameUnedited
            })).data.msg.query.pages;
            let wikiArr:string[] = wikiInfo[Object.keys(wikiInfo)[0]].extract.split("\n==");
            animalWikiInfo = wikiArr[0];
        }catch(e){
            return ["error", e];
        }
    }

    function rdrctJournal(){
        goto("animalBook");
    }
    
</script>

<div class="bg-[#E1FFC4] border-box p-[20px]">
    <button onclick={rdrctJournal} class="koho text-[20px] bg-[#FFDBE6] hover:bg-[#FFC8D7] pink-btn rounded-[18px] hover:bg-[#FFC8D7]">Return to journal</button>
    <br>
    
    <div class="h-[100vh]" id="entryAddingDiv">
        <h1 class="koulen text-center text-[60px]">Add Entry</h1>
        <hr class="border-[1px] border-black w-[25%] m-auto">
        <br>
        <input type="file" accept="image/*" bind:this={imgInput} onchange={detect} class="bg-[#FFFAED] rounded-full block m-auto pr-[15px] koho text-[20px] file-input relative">
        <br>
        <div class="text-center {uploadedImgDiv}">
            <img src={uploadedImg} alt="your uploaded img" class="m-auto object-cover rounded-[15px] img-hover">
            <br>
            <button onclick={send} class="koho text-[20px] bg-[#FFDBE6] hover:bg-[#FFC8D7] pink-btn rounded-[18px] hover:bg-[#FFC8D7]">Submit Image</button>
            <br>
            <p class="text-red-500">{errMsg}</p>
        </div>
        <br>
    </div>

    <div class="flex w-[95%] justify-around h-[90vh] {journalEntryFields} m-auto" id="journalAndInfo" bind:this={journalAndInfoDiv}>
        <div class="w-[49%]">
            <div>
                <label for="commonName" class="koho text-[20px]">Common Name</label>
                <br>
                <input type="text" class="w-[90%] rounded-full bg-[#FFFAED] pl-[15px] h-[40px]" name="commonName" id="commonName" autocomplete="off" bind:value={commonName}>
                <br>
                <br>
                <label for="scientificName" class="koho text-[20px]">Scientific Name</label>
                <br>
                <input type="text" class="w-[90%] rounded-full bg-[#FFFAED] pl-[15px] h-[40px]" name="scientificName" id="scientificName" autocomplete="off" bind:value={scientificName}>
                <br>
                <br>
                <label for="foundWhere" class="koho text-[20px]">Where was it found?</label>
                <br>
                <input type="text" class="w-[90%] rounded-full bg-[#FFFAED] pl-[15px] h-[40px]" name="foundWhere" id="foundWhere" autocomplete="off" bind:value={foundWhere}>
                <br>
                <br>
                <label for="notes" class="koho text-[20px]">Notes</label>
                <br>
                <textarea id="notes" class="w-[90%] rounded-[20px] bg-[#FFFAED] pl-[15px] h-[130px]" bind:value={notes}></textarea>
                <br>
                <br>
                <button onclick={addEntry} class="koho text-[20px] bg-[#FFDBE6] hover:bg-[#FFC8D7] pink-btn rounded-[18px] hover:bg-[#FFC8D7] block m-auto">Add to Journal</button>
                <br>
            </div>
        </div>
        
        <div class="{learnAboutDiv} w-[49%] bg-[#C1ED96] rounded-[15px] overflow-auto scrollbar border-box p-[20px]">
            <h1 class="kaisei-tokumin text-[30px]">Looks like this is a(n) {commonNameUnedited}!</h1>
            <h3 class="koho text-[25px]">Status: {endStatus}</h3>
            <br>
            <div>
                <h3 class="koho text-[25px]">Info:</h3>
                <p class="koho text-[18px]">{animalWikiInfo}</p>
                <a class="koho text-[18px] underline text-[#ff14a9]" href={`https://en.wikipedia.org/wiki/${commonNameUnedited.split(" ").join("_")}`} target="_blank">Read more on Wikipedia</a>
            </div>
            <br>
            <br>
            <h3 class="koho text-[25px]">Threats?</h3>
            <ul>
                {#each threats as threat}
                    <li class="koho text-[18px]">{threat}</li>
                {/each}
            </ul>
        </div>
    </div>
</div>

<style>
    .koulen{
        font-family: "Koulen", sans-serif;
    }

    .koho{
        font-family: "koho", sans-serif;
    }

    .kaisei-tokumin{
        font-family: "kaisei-tokumin", serif;
    }

    @keyframes pink-btn-1{
        from{width: 160px; height: 50px}
        to{width: 165px; height: 55px}
    }

    @keyframes pink-btn-2{
        to{width: 160px; height: 50px}
        from{width: 165px; height: 55px}
    }

    .pink-btn{
        width: 160px;
        height: 50px;
        animation: pink-btn-2 0.5s ease-out;
    }

    .pink-btn:hover{
        width: 165px;
        height: 55px;
        animation: pink-btn-1 0.5s ease-out;
    }

    @keyframes file-input-1{
        from{height:40px;width:30%}
        to{height:42px;width:32%}
    }

    @keyframes file-input-2{
        to{height:40px;width:30%}
        from{height:42px;width:32%}
    }

    .file-input{
        height:40px;
        width:30%;
        animation: file-input-2 0.5s ease-out;
    }

    .file-input:hover{
        height:42px;
        width:32%;
        animation: file-input-1 0.5s ease-out;
    }

    .file-input::file-selector-button{
        background-color: #F0E1BA;
        width: 40%;
        left:0;
        height:100%;
    }

    .file-input::file-selector-button:hover{
        background-color: #f1dba2;
    }

    @keyframes img-hover-1{
        from{width:30vw} to{width:32vw}
    }

    @keyframes img-hover-2{
        to{width:30vw} from{width:32vw}
    }

    .img-hover{
        width:30vw;
        animation: img-hover-2 0.5s ease-out;
    }

    .img-hover:hover{
        width:32vw;
        animation: img-hover-1 0.5s ease-out;
    }

    .scrollbar{
        scrollbar-width: thin;
        scrollbar-color: #FFDBE6 white;
    }
</style>