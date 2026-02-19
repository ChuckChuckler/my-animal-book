<script lang="ts">
    import { goto } from "$app/navigation";
    import AnimalBook from "$lib/components/AnimalBook.svelte";
    import { onMount } from "svelte";

    function rdrctHome(){
        goto("home");
    }

    function addEntry(){
        goto("addEntry");
    }
</script>

<button onclick={rdrctHome}>Return home</button>
<br>
<AnimalBook bookOwner="" ownerIsUser={true} width="80" clickable={true}></AnimalBook>
<br>
<button onclick={addEntry}>Add Entry</button>