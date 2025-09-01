<script lang="ts">
    import { goto } from "$app/navigation";
    import Button from "$lib/components/Button.svelte";
    import { Game } from "$lib/game.js";
    import { extractValuesFromPresenceState } from "$lib/supabase.js";
    import type { RealtimeChannel } from "@supabase/supabase-js";
    import { onDestroy, onMount } from "svelte";

    const { data } = $props();
    const { lobbyName, host_id, supabase, user } = $derived(data);

    type memberList = Array<{ uuid: string }>;
    let lobbyMembers: memberList = $state([]);

    let channel: RealtimeChannel | null = $state(null);

    // If host leaves, lobby is closed
    let hostPresent = $state(true);
    function hostExitedLobby() {
        hostPresent = false;
        // Redirect to home page after short delay
        setTimeout(() => {
            goto("/");
        }, 2000);
    }

    let gameStarted = $state(false);
    function receivedGameStartSignal() {
        if (gameStarted) {
            // Don't execute multiple times
            return;
        }
        gameStarted = true;
        // Redirect to game page after short delay
        setTimeout(() => {
            goto(`/game/${host_id}`);
        }, 2000);
    }

    onMount(() => {
        if (!user) {
            throw new Error("User not authenticated");
        }

        // Subscribe to channel lobby
        channel = supabase.channel(`lobby:${host_id}`);
        channel
            .on("presence", { event: "sync" }, () => {
                if (!channel) {
                    throw new Error(
                        "Channel not initialized when receiving presence sync",
                    );
                }
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
            .on("broadcast", { event: "game_started" }, receivedGameStartSignal)
            .subscribe(async (_status) => {
                if (!channel) {
                    throw new Error("Channel not initialized when subscribing");
                }
                // Share own user ID after connecting
                await channel.track({
                    uuid: user.id,
                });
            });
    });

    // Callback executed to disconnect from lobby channel when leaving page
    let disconnect = $derived(() => {
        if (!channel) {
            return;
        }
        channel.untrack();
        supabase.removeChannel(channel);
        // If you are the host, delete the lobby
        if (host_id === user?.id) {
            console.log("Host is leaving, deleting lobby");
            supabase.from("lobbies").delete().eq("host_id", host_id);
        }
    });

    onDestroy(() => {
        disconnect();
    });

    const minimumPlayers = 5;
    const maxPlayers = 10;

    let startGame = $derived(() => {
        if (lobbyMembers.length < minimumPlayers) {
            throw new Error(
                `Cannot start game, need at least ${minimumPlayers} players`,
            );
        } else if (lobbyMembers.length > maxPlayers) {
            throw new Error(`Cannot start game, max players is ${maxPlayers}`);
        }

        // If host, start new game
        if (host_id !== user?.id) {
            throw new Error("Only the host can start the game");
        }

        // Create new game and upload to DB
        const game = Game.new(
            host_id,
            lobbyMembers.map((m) => m.uuid),
        );
        game.toDB(supabase).then(() => {
            // Notify all players in lobby that game has started
            if (!channel) {
                throw new Error("Channel not initialized when starting game");
            }
            channel.send({
                type: "broadcast",
                event: "game_started",
                payload: {},
            });
            receivedGameStartSignal();
        });
    });

    function createDummyLobbyMembers() {
        const dummyUIDs = Array.from({ length: 5 }, () =>
            crypto.randomUUID(),
        );
        lobbyMembers = [...lobbyMembers, ...dummyUIDs.map((uuid) => ({ uuid }))];
    }
</script>

<div
    class="p-4 sm:p-8 md:p-12 w-full sm:w-3/4 md:w-1/2 lg:w-1/3 m-auto flex flex-col justify-center items-center gap-4 sm:gap-8 bg-white"
>
    <h1 class="text-3xl mb-4">
        <span title="It's called a lobby because it's where lobsters hang out."
            >Lobby</span
        >: <span class="font-bold">{lobbyName}</span>
    </h1>
    {#if hostPresent && !gameStarted}
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
                Share the lobby name <span class="font-bold">{lobbyName}</span> with
                others so they can join!
            </p>
            <Button
                disabled={lobbyMembers.length < minimumPlayers ||
                    lobbyMembers.length > maxPlayers}
                title={lobbyMembers.length < minimumPlayers
                    ? `Need at least ${minimumPlayers} players to start`
                    : lobbyMembers.length > maxPlayers
                      ? `Maximum players is ${maxPlayers}`
                      : "Start the game"}
                onclick={startGame}
            >
                Start Game
            </Button>
        {:else}
            <p class="mt-4 text-blue-600 font-bold">
                Waiting for the host to start the game...
            </p>
        {/if}
    {:else if gameStarted}
        <div class="text-green-500 text-center">
            <p class="text-xl font-bold">Game is starting!</p>
            <p>You will be redirected to the game page shortly.</p>
        </div>
    {:else}
        <div class="text-red-500 text-center">
            <p class="text-xl font-bold">Host has left the lobby.</p>
            <p>You will be redirected to the home page shortly.</p>
        </div>
    {/if}

    <a href="/" class="mt-4 text-gray-600 underline hover:text-gray-800"
        >Leave Lobby</a
    >
</div>

<Button onclick={createDummyLobbyMembers}>
    Add Dummy Lobby Members (for testing)
</Button>
