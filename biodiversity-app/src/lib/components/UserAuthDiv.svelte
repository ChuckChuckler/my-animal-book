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

<h3>{authType}</h3>
<label for="user">Username</label>
<br>
<input type="text" placeholder="Username" autocomplete="off" id="user" bind:value={user}>
<br>
<label for="pass">Password</label>
<br>
<input type="password" placeholder="Password" autocomplete="off" id="pass" bind:value={pass}>
<br>
<p>{errMsg}</p>
<br>
<button onclick={sendToAuth}>{authType}</button>