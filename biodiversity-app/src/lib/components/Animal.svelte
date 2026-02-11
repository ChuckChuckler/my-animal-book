<script lang="ts">
    import axios from "axios";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";

    let { commonName, scientificName, threatLevel, id } = $props();

    onMount(()=>{
        document.getElementById(id)?.addEventListener("click", function(){
            goto(`animal/${id}`);
        })
    })
</script>

<div id={id}>
    <h1>{commonName}</h1>
    <h3>{scientificName}</h3>
    <h2>{threatLevel}</h2>
</div>