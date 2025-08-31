<script lang="ts">
    import { goto } from "$app/navigation";
    import Button from "$lib/components/Button.svelte";
    import { extractValuesFromPresenceState } from "$lib/supabase.js";
    import { onDestroy, onMount } from "svelte";

    const { data } = $props();
    const { lobbyName, host_id, supabase, user } = $derived(data);

    type memberList = Array<{ uuid: string }>;
    let lobbyMembers: memberList = $state([]);

    // If host leaves, lobby is closed
    let hostPresent = $state(true);
    function hostExitedLobby() {
        hostPresent = false;
        // Redirect to home page after short delay
        setTimeout(() => {
            goto("/");
        }, 2000);
    }

    // Callback executed to disconnect from lobby channel when leaving page
    let disconnect = () => {};

    onMount(() => {
        if (!user) {
            throw new Error("User not authenticated");
        }

        // Subscribe to channel lobby
        const channel = supabase.channel(`lobby:${host_id}`);
        channel
            .on("presence", { event: "sync" }, () => {
                const newState = channel.presenceState();
                lobbyMembers = extractValuesFromPresenceState(newState, [
                    "uuid",
                ]) as memberList;
                if (
                    host_id !== user.id &&
                    !lobbyMembers.find((member) => member.uuid === host_id)
                ) {
                    // Host is not in the lobby!
                    hostExitedLobby();
                }
            })
            .subscribe(async (status) => {
                await channel.track({
                    uuid: user.id,
                });
            });
        disconnect = () => {
            channel.untrack();
            supabase.removeChannel(channel);
            // If you are the host, delete the lobby
            if (host_id === user?.id) {
                console.log("Host is leaving, deleting lobby");
                supabase.from("lobbies").delete().eq("host_id", host_id);
            }
        };
    });

    onDestroy(() => {
        disconnect();
    });

    const minimumPlayers = 5;
    let canStartGame = $derived(lobbyMembers.length >= minimumPlayers);

    function startGame() {
        if (!canStartGame) {
            console.error(
                `Cannot start game, need at least ${minimumPlayers} players`,
            );
            return;
        }
        // TODO
    }
</script>

<div
    class="p-4 sm:p-8 md:p-12 w-full sm:w-3/4 md:w-1/2 lg:w-1/3 m-auto flex flex-col justify-center items-center gap-4 sm:gap-8 bg-white"
>
    <h1 class="text-3xl mb-4">
        Lobby: <span class="font-bold">{lobbyName}</span>
    </h1>
    {#if hostPresent}
        <h2 class="text-2xl mb-2">Currently present:</h2>
        <ol class="w-full border border-gray-300 rounded-md overflow-hidden">
            {#each lobbyMembers as member}
                <li class="border-b border-gray-300 py-2 w-full text-center">
                    {member.uuid}
                </li>
            {/each}
        </ol>

        {#if host_id === user?.id}
            <p class="mt-4 text-green-600 font-bold text-center">
                You are the host.
            </p>
            <p class="text-sm text-gray-600 text-center">
                Share the lobby name <span class="font-bold">{lobbyName}</span> with others so they can join!
            </p>
            <Button
                disabled={!canStartGame}
                title={canStartGame
                    ? "Start the game"
                    : `Need at least ${minimumPlayers} players`}
                onclick={startGame}
            >
                Start Game
            </Button>
        {:else}
            <p class="mt-4 text-blue-600 font-bold">
                Waiting for the host to start the game...
            </p>
        {/if}
    {:else}
        <div class="text-red-500 text-center">
            <p class="text-xl font-bold">Host has left the lobby.</p>
            <p>You will be redirected to the home page shortly.</p>
        </div>
    {/if}

    <a
        href="/"
        class="mt-4 text-gray-600 underline hover:text-gray-800"
        >Leave Lobby</a
    >
</div>
