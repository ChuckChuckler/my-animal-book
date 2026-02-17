<script lang="ts">
    let { animalName, animalImage, dateOfEntry } = $props();
</script>
<div class="w-[30vw] bg-red-100">
    <h1>{animalName}</h1>
    <img src={animalImage} alt={`Photo of ${animalName}`} class="w-[20vw]">
    <h3>{dateOfEntry}</h3>
</div>