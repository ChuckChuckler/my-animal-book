<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import axios from "axios";

    onMount(async ()=>{
        let username = document.cookie.split("=")[1];
        const journal = (await axios.post("/api/getJournal", {
            username:username
        })).data.msg.journal;
    })

    function addEntry(){
        goto("addEntry");
    }

    function rdrctHome(){
        goto("home");
    }
</script>

<button onclick={rdrctHome}>Return home</button>
<br>

<h1>Animal Book</h1>
<div>

</div>
<br>
<button onclick={addEntry}>Add Entry</button>