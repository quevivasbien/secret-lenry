<script lang="ts">
    import { Game } from "$lib/game.js";
    import { error } from "@sveltejs/kit";
    import { onMount } from "svelte";

    let { data } = $props();
    let { host_id, supabase, user } = $derived(data);

    let amHost = $derived(user?.id === host_id);
    let game: Game | null = $state(null);

    onMount(() => {
        if (!user) {
            throw new Error("User not authenticated");
        }

        // Note: error handling doesn't work properly here, can't redirect to error page within Promise
        Game.fromDB(supabase, host_id).then((g) => {
            game = g;
            if (!game) {
                error(404, "Game not found");
            }
        });
    });
</script>

{#if !game}
    <p class="text-center">Loading game...</p>
{:else}
    {JSON.stringify(game)}
{/if}
