<script>
    import { onMount } from "svelte";
    import UserAuthDiv from "$lib/components/UserAuthDiv.svelte";

    onMount(()=>{
        const stored=localStorage.getItem("animalDict");
        if(stored!=null){
            localStorage.removeItem("animalDict");
        }
    })
</script>

<h1>My Animal Book</h1>
<UserAuthDiv authType = "Sign Up"></UserAuthDiv>
<br>
<br>
<UserAuthDiv authType = "Log In"></UserAuthDiv>