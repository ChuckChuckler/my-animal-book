<script lang="ts">
    import { onMount, tick, onDestroy } from "svelte";
    import UserAuthDiv from "$lib/components/UserAuthDiv.svelte";
    import gsap from "gsap";
    import { ScrollTrigger, ScrollToPlugin } from "gsap/all";

    import animalBookLogo from "$lib/assets/logo.png";
    import overlayTop from "$lib/assets/overlay_top.png";
    import overlayBottom from "$lib/assets/overlay_bottom.png";

    let ctx:any;
    let animRunning:any;

    onMount(async ()=>{
        gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

        const stored=localStorage.getItem("animalDict");
        if(stored!=null){
            localStorage.removeItem("animalDict");
        }

        await tick();
        ctx=gsap.context(()=>{
            ScrollTrigger.create({
                trigger:"#authDivs",
                start: "top bottom",
                end: "bottom bottom",
                onEnter:()=>{
                    if(!animRunning){
                        animRunning=true;
                        gsap.to(window,{
                            scrollTo: "#authDivs",
                            duration: 1.5,
                            ease:"power3.out",
                            onComplete:()=>{
                                animRunning=false;
                            }
                        });
                    }
                }
            });

            ScrollTrigger.create({
                trigger:"#welcomeDiv",
                start: "bottom top",
                onLeaveBack:()=>{
                    if(!animRunning){
                        animRunning=true;
                        gsap.to(window,{
                            scrollTo: "#welcomeDiv",
                            duration: 1.5,
                            ease: "power3.out",
                            onComplete:()=>{
                                animRunning=false;
                            }
                        });
                    }
                }
            });
        })
    });

    onDestroy(()=>{
        ctx?.revert();
        ScrollTrigger.killAll();
    })
</script>

<div class="h-[100vh] relative bg-linear-to-b from-[#61cdff] to-[#E2FFF5]" id="welcomeDiv">
    <img src={overlayTop} alt="overlay top" class="object-cover w-[100%]">
    <img src={animalBookLogo} alt="my animal book logo" class="app-logo absolute left-[50%] top-[50%] transform-[translate(-50%,-50%)] z-3">
    <img src={overlayBottom} alt="overlay bottom" class="object-cover w-[100%] absolute bottom-0">
</div>

<div class="flex justify-around w-[100%] bg-[#3f7d28] h-[100vh]" id="authDivs">
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