<script lang="ts">
    import axios from "axios";
    let { authType } = $props();
    import { goto } from "$app/navigation";

    let user = $state("");
    let pass = $state("");
    let errMsg = $state("");

    async function sendToAuth(){
        if(user.length < 3 || user.length > 15){
            errMsg = "Username must be 3-15 characters long";
        }else if(user.includes(" ")){
            errMsg = "No spaces allowed in username"
        }else if(pass.length < 8){
            errMsg = "Password must be 8+ characters long";
        }else{
            await axios.post("/api/userAuth",{
                username: user,
                password: pass,
                type: authType
            })
            .then((response)=>{
                errMsg=response.data.msg;
                if(response.data.success){
                    document.cookie = `username=${user}`;
                    goto("home");
                }
            })
            .catch((e)=>{
                errMsg=e;
            })
        }
    }
</script>

<div class="bg-[#c0f0af] auth-div rounded-[50px] border-box p-[15px] m-auto z-10">
    <h3 class="text-center text-[40px] koulen">{authType}</h3>
    <div class="m-auto w-[85%]">
        <label for="user" class="kaisei-tokumin text-[30px]">Username</label>
        <br>
        <input type="text" placeholder="Username" autocomplete="off" id="user" class="bg-[#FFFAED] w-[100%] h-[50px] pl-[10px] rounded-full koho" bind:value={user}>
    </div>
    <br>
    <div class="m-auto w-[85%]">
        <label for="pass" class="kaisei-tokumin text-[30px]">Password</label>
        <br>
        <input type="password" placeholder="Password" autocomplete="off" id="pass" class="bg-[#FFFAED] w-[100%] h-[50px] pl-[10px] rounded-full koho" bind:value={pass}>
    </div>
    <br>
    <p class="text-red-500">{errMsg}</p>
    <br>
    <button class="block auth-btn bg-[#FFDBE6] hover:bg-[#FFC8D7] rounded-[23px] m-auto koho text-[25px]" onclick={sendToAuth}>{authType}</button>
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

    @keyframes nav-btns-1{
        to{width:52%;height:100px}
        from{width:50%;height:98px}
    }

    @keyframes nav-btns-2{
        from{width:52%;height:100px}
        to{width:50%;height:98px}
    }

    .auth-btn{
        width: 50%;
        height: 98px;
        animation: nav-btns-2 0.5s ease-out;
    }

    .auth-btn:hover{
        width: 52%;
        height: 98px;
        animation: nav-btns-1 0.5s ease-out;
    }

    @keyframes auth-div-1{
        from{width:48%;height:85vh;}
        to{width:50%;height:86vh}
    }

    @keyframes auth-div-2{
        to{width:48%;height:85vh;}
        from{width:50%;height:86vh}
    }

    .auth-div{
        width:48%;
        height:85vh;
        animation: auth-div-2 0.5s ease-out;
    }

    .auth-div:hover{
        width:50%;
        height:86vh;
        animation: auth-div-1 0.5s ease-out;
    }
</style>