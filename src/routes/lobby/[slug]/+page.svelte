<script lang="ts">
    import type { SupabaseClient } from "@supabase/supabase-js";
    import { onMount } from "svelte";

    const { data } = $props();
    const { lobbyName, host_id, supabase } = $derived(data);

    function subscribe(supabase: SupabaseClient) {
        supabase
            .channel("public:lobby_members")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "lobby_members",
                    // filter: `host_id=eq.${host_id}`,
                },
                (payload: any) => {
                    console.log("Change received!", payload);
                },
            )
            .subscribe((status) => {
                if (status === "SUBSCRIBED") {
                    console.log(
                        "Subscribed to lobby_members changes, where host_id =",
                        host_id,
                    );
                } else {
                    console.log("Subscription status:", status);
                }
            });
    }

    onMount(() => {
        subscribe(supabase);
        supabase
            .from("lobby_members")
            .select("*")
            .filter("host_id", "eq", host_id)
            .then(({ data, error }) => {
                if (error) {
                    console.error("Error fetching lobby members:", error);
                } else {
                    console.log("Current lobby members:", data);
                }
            });
    });
</script>

<div
    class="p-4 sm:p-8 md:p-12 w-full sm:w-3/4 md:w-1/2 lg:w-1/3 m-auto flex flex-col justify-center items-center gap-4 sm:gap-8 bg-white"
>
    <h1 class="text-3xl font-bold mb-4">Lobby: {lobbyName}</h1>
    {#if host_id}
        <p>Host ID: {host_id}</p>
        <a href="/" class="text-blue-500 underline mt-4">Exit lobby</a>
    {:else}
        <p>Lobby not found.</p>
        <a href="/" class="text-blue-500 underline mt-4">Go back to home</a>
    {/if}
</div>
