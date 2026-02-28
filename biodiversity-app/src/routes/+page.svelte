<script lang="ts">
    import { onMount } from "svelte";
    import UserAuthDiv from "$lib/components/UserAuthDiv.svelte";

    import animalBookLogo from "$lib/assets/logo.png";
    import overlayTop from "$lib/assets/overlay_top.png";
    import overlayBottom from "$lib/assets/overlay_bottom.png";

    onMount(()=>{
        const stored=localStorage.getItem("animalDict");
        if(stored!=null){
            localStorage.removeItem("animalDict");
        }
    })
</script>

<div class="h-[100vh] relative bg-linear-to-b from-[#61cdff] to-[#E2FFF5]">
    <img src={overlayTop} alt="overlay top" class="object-cover w-[100%]">
    <img src={animalBookLogo} alt="my animal book logo" class="app-logo absolute left-[50%] top-[50%] transform-[translate(-50%,-50%)] z-3">
    <img src={overlayBottom} alt="overlay bottom" class="object-cover w-[100%] absolute bottom-0">
</div>

<div class="flex justify-around w-[100%] bg-[#3f7d28] h-[100vh]">
    <UserAuthDiv authType = "Sign Up"></UserAuthDiv>
    <UserAuthDiv authType = "Log In"></UserAuthDiv>
</div>

<style>
    @keyframes app-logo-1{
        from{width:50vw}
        to{width:54vw}
    }

    @keyframes app-logo-2{
        to{width:50vw}
        from{width:54vw}
    }

    .app-logo{
        width:50vw;
        animation: app-logo-2 0.5s ease-out;
    }

    .app-logo:hover{
        width:54vw;
        animation: app-logo-1 0.5s ease-out;
    }
</style>