<script lang="ts">
    import axios from "axios";

    let errMsg:any = $state("");
    let uploadedImg:string = $state("");

    let imgInput:any;
    function detect(){
        if(imgInput.files[0]!=undefined){
            let imagePreview = URL.createObjectURL(imgInput.files[0]);
            uploadedImg = imagePreview;
        }else{
            errMsg="Please upload an image";
        }
    }

    async function send(){
        let b64:any="";
        if(imgInput.files[0]!=undefined){
            const reader = new FileReader();
            reader.onloadend=async ()=>{
                b64 = reader.result;
                if(b64!=null){
                    b64=b64.replace("data:","").replace(/^.+,/, "");
                    try{
                        const response = (await axios.post("/api/detectAnimal", {
                            b64:b64
                        })).data.msg;
                        console.log(response);
                    }catch(e){
                        errMsg=e;
                    }
                }
            }
            reader.readAsDataURL(imgInput.files[0]);
        }else{
            errMsg="Please upload an image";
        }
    }
</script>

<h1>Add Entry</h1>
<input type="file" accept="image/*" bind:this={imgInput} onchange={detect}>
<br>
<button onclick={send}>detect</button>
<br>
<img src={uploadedImg} alt="your uploaded img">
<p>{errMsg}</p>