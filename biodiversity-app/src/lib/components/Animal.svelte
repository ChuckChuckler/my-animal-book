<script lang="ts">
    import axios from "axios";
    let { commonName, scientificName, threatLevel} = $props();
</script>

<div>
    <h1>{commonName}</h1>
    <h3>{scientificName}</h3>
    <h2>{threatLevel}</h2>
</div>