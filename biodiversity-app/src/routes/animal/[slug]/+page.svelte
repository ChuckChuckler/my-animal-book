<script lang="ts">
    import { json } from "@sveltejs/kit";
    import type { PageProps } from "./$types";

    let { data }:PageProps = $props();
</script>

<h1>{data.commonName}</h1>